import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google Gemini AI SDK on the server
// The API key is securely loaded from environment variables (process.env.GEMINI_API_KEY)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API route: Generate warm encouragement and actionable advice for tomorrow
app.post('/api/encourage', async (req, res) => {
  try {
    const { emotion, diaryContent, date, authorName } = req.body;

    if (!diaryContent || typeof diaryContent !== 'string') {
      return res.status(400).json({ error: '일기 내용을 입력해주세요.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY가 환경 변수에 설정되어 있지 않습니다. .env 파일 또는 배포 환경변수를 확인해주세요.',
      });
    }

    const emotionKoreanMap: Record<string, string> = {
      joy: '기쁨 (행복하고 마음이 벅참)',
      tired: '지침 (몸과 마음이 무겁고 쉼이 필요함)',
      flutter: '설렘 (가슴이 두근거리고 기대됨)',
      anxious: '불안 (걱정과 초조함, 긴장됨)',
    };

    const emotionLabel = emotionKoreanMap[emotion] || emotion || '기쁨';

    const systemInstruction = `
당신은 사용자의 하루를 가장 진심으로 보듬어주는 '따뜻한 하루 일기 전담 AI 친구 & 비서'입니다.
말투는 부드럽고 다정하며 공감 가득한 한국어 존댓말(~해요, ~했군요, ~길 바라요)을 사용하세요.
상투적이거나 딱딱한 기계적인 말투는 절대 피하고, 손편지를 쓰는 것처럼 마음을 울리는 따뜻함을 담아주세요.

사용자가 건넨 일기와 오늘 느낀 감정:
- 오늘의 감정: ${emotionLabel}
- 작성일: ${date || '오늘'}
- 작성자 이름/별칭: ${authorName || '당신'}

반드시 다음 3가지 핵심 요소를 포함하여 JSON으로 응답해야 합니다:
1. warmTitle: 이 일기에 어울리는 따뜻하고 시적인 한 줄 제목 (예: "오늘 하루도 참 고생 많았어요", "작은 별처럼 반짝인 오늘의 순간")
2. comfortMessage: 오늘 하루 일어난 일과 사용자가 느낀 감정(${emotionLabel})을 깊이 공감하고 위로/축하해주는 다정한 편지글 (3~5문장 내외)
3. tomorrowAction: 내일을 기분 좋게 시작하기 위한 '구체적이고 부담 없는 긍정적인 작은 실천 1가지' (예: "내일 아침 창문을 열고 10초간 시원한 공기 깊게 들이마시기", "내가 좋아하는 따뜻한 차 한 잔을 온전히 음미하며 마시기")
4. warmQuote: 마음에 잔잔한 여운을 남기는 따뜻한 응원의 한마디 (한 문장)
`;

    const prompt = `[오늘의 일기 내용]\n${diaryContent}`;

    // Candidate models to try in case of temporary high demand or 503
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];

    let lastError: any = null;
    let parsedResult: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                warmTitle: {
                  type: Type.STRING,
                  description: '따뜻하고 감성적인 한 줄 제목',
                },
                comfortMessage: {
                  type: Type.STRING,
                  description: '사용자의 감정을 다정하게 위로하고 지지하는 본문 편지글',
                },
                tomorrowAction: {
                  type: Type.STRING,
                  description: '내일을 위한 긍정적이고 구체적인 행동 제안 1가지',
                },
                warmQuote: {
                  type: Type.STRING,
                  description: '가슴에 스며드는 따뜻한 한 줄 응원 문구',
                },
              },
              required: ['warmTitle', 'comfortMessage', 'tomorrowAction', 'warmQuote'],
            },
          },
        });

        const resultText = response.text;
        if (resultText) {
          parsedResult = JSON.parse(resultText);
          break; // Succeeded!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err?.message || err);
        // If 503 (high demand) or 429, continue to next candidate model
        const errMsg = err?.message || '';
        if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE')) {
          continue;
        }
      }
    }

    // If all models failed or encountered a temporary spike, provide a warm fallback
    if (!parsedResult) {
      console.warn('All candidate models failed or busy. Using graceful fallback.');
      
      const fallbackResponses: Record<string, any> = {
        joy: {
          warmTitle: "작은 별처럼 반짝인 오늘의 행복",
          comfortMessage: `${authorName || '당신'}님, 오늘 이렇게 기쁘고 감사한 순간들을 남겨주셔서 읽는 제 마음까지 따스해져요. 일상의 소소한 행복을 발견하고 소중히 간직하는 당신의 다정한 시선이 참 아름답습니다. 오늘의 이 벅찬 온기가 마음에 오래도록 머물기를 바라요.`,
          tomorrowAction: "내일 아침 눈을 떴을 때, 오늘 가장 행복했던 순간을 떠올리며 미소 지어보기",
          warmQuote: "행복은 이미 당신의 작은 일상 속에 피어나고 있어요.",
        },
        tired: {
          warmTitle: "오늘 하루도 정말 고생 많았어요",
          comfortMessage: `${authorName || '당신'}님, 오늘 하루 무거운 짐을 지고 버텨내느라 정말 수고 많으셨어요. 지치고 힘든 날에는 아무것도 더 잘해내려 애쓰지 않아도 괜찮아요. 오늘은 모든 걱정을 잠시 내려놓고, 당신의 몸과 마음이 온전히 쉴 수 있도록 편안한 밤을 선물해주세요.`,
          tomorrowAction: "내일은 내가 좋아하는 따뜻한 음료 한 잔을 마시며 5분간 온전히 나만의 휴식 갖기",
          warmQuote: "쉬어가는 것은 멈추는 것이 아니라, 다시 나아갈 힘을 채우는 시간이에요.",
        },
        flutter: {
          warmTitle: "두근거리는 설렘을 담은 내일",
          comfortMessage: `${authorName || '당신'}님의 설레는 마음이 글자 하나하나에서 피어나는 것 같아요. 새로운 기대와 두근거림은 우리 삶을 가장 아름답게 물들이는 소중한 빛이랍니다. 이 기분 좋은 떨림을 나침반 삼아, 당신만의 속도로 한 걸음씩 나아가보세요.`,
          tomorrowAction: "내일 기대되는 순간을 위해 가볍고 경쾌한 음악 한 곡 들으며 하루 시작하기",
          warmQuote: "설레는 마음은 당신의 새로운 계절이 시작되고 있다는 신호예요.",
        },
        anxious: {
          warmTitle: "불안한 마음에 건네는 다정한 토닥임",
          comfortMessage: `${authorName || '당신'}님, 머릿속이 복잡하고 마음이 조마조마한 밤이었군요. 불안하다는 건, 그만큼 내 삶과 내일을 진심으로 아끼고 잘 해내고 싶다는 소중한 증거예요. 자책하지 말고, 지금 이 순간만큼은 천천히 숨을 깊게 들이쉬며 당신을 안아주세요. 다 지나갈 거예요.`,
          tomorrowAction: "내일 아침 창문을 활짝 열고 10초간 시원한 바람을 깊게 들이마시며 기지개 켜기",
          warmQuote: "파도는 높게 일어도, 깊은 바다는 언제나 고요합니다.",
        },
      };

      parsedResult = fallbackResponses[emotion] || fallbackResponses.tired;
    }

    return res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error: any) {
    console.error('Error generating AI encouragement:', error);
    return res.status(500).json({
      error: error?.message || 'AI 응원 메시지를 생성하는 중 오류가 발생했습니다.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  res.json({ status: 'ok', hasGeminiKey: hasKey });
});

async function startServer() {
  if (!isProd) {
    // Development mode: attach Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
