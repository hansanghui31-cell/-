import { AIEncouragement, EmotionType } from '../types';

export interface RequestEncouragementParams {
  emotion: EmotionType;
  diaryContent: string;
  date: string;
  authorName?: string;
}

export async function requestAIEncouragement(params: RequestEncouragementParams): Promise<AIEncouragement> {
  // 1. Try server-side route first (/api/encourage)
  try {
    const res = await fetch('/api/encourage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        return {
          ...data.data,
          createdAt: new Date().toISOString(),
        };
      }
    } else {
      const errJson = await res.json().catch(() => null);
      if (errJson && errJson.error) {
        if (res.status !== 404) {
          let errorMsg = errJson.error;
          // Clean up if error message is raw JSON string
          if (typeof errorMsg === 'string' && errorMsg.includes('"error":')) {
            try {
              const parsedErr = JSON.parse(errorMsg);
              if (parsedErr?.error?.code === 503 || parsedErr?.error?.status === 'UNAVAILABLE') {
                errorMsg = '현재 AI 서비스에 요청이 일시적으로 몰려 있습니다. 잠시 후 다시 시도해주세요.';
              } else if (parsedErr?.error?.message) {
                errorMsg = parsedErr.error.message;
              }
            } catch {
              // keep as is
            }
          }
          throw new Error(errorMsg);
        }
      }
    }
  } catch (err: any) {
    // If not a network 404, rethrow real server errors
    if (err.message && !err.message.includes('404') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // 2. Client-side fallback for static Vercel deployment if VITE_GEMINI_API_KEY is configured
  const viteApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (viteApiKey) {
    const emotionKoreanMap: Record<string, string> = {
      joy: '기쁨 (행복하고 마음이 벅참)',
      tired: '지침 (몸과 마음이 무겁고 쉼이 필요함)',
      flutter: '설렘 (가슴이 두근거리고 기대됨)',
      anxious: '불안 (걱정과 초조함, 긴장됨)',
    };
    const emotionLabel = emotionKoreanMap[params.emotion] || params.emotion;

    const systemPrompt = `
당신은 사용자의 하루를 가장 진심으로 보듬어주는 '따뜻한 하루 일기 전담 AI 친구 & 비서'입니다.
말투는 부드럽고 다정하며 공감 가득한 한국어 존댓말(~해요, ~했군요, ~길 바라요)을 사용하세요.
상투적이거나 딱딱한 기계적인 말투는 절대 피하고, 손편지를 쓰는 것처럼 마음을 울리는 따뜻함을 담아주세요.

사용자가 건넨 일기와 오늘 느낀 감정:
- 오늘의 감정: ${emotionLabel}
- 작성일: ${params.date}
- 작성자 이름/별칭: ${params.authorName || '당신'}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "warmTitle": "따뜻하고 시적인 한 줄 제목",
  "comfortMessage": "감정에 깊이 공감하고 위로/응원하는 다정한 편지글 (3~5문장)",
  "tomorrowAction": "내일을 위한 구체적이고 부담 없는 긍정적인 작은 실천 1가지",
  "warmQuote": "가슴에 스며드는 따뜻한 한 줄 응원 문구"
}
`;

    const userPrompt = `[오늘의 일기 내용]\n${params.diaryContent}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${viteApiKey}`;
    const directRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!directRes.ok) {
      const errData = await directRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Gemini API 호출에 실패했습니다.');
    }

    const jsonResult = await directRes.json();
    const rawText = jsonResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return {
        ...parsed,
        createdAt: new Date().toISOString(),
      };
    }
  }

  throw new Error('Gemini API 키가 설정되지 않았습니다. 서버 환경변수(GEMINI_API_KEY) 또는 클라이언트 환경변수(VITE_GEMINI_API_KEY)를 설정해주세요.');
}
