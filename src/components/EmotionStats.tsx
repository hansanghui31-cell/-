import React from 'react';
import { DiaryEntry, EmotionType } from '../types';
import { EMOTIONS } from '../constants/emotions';
import { CheckCircle2, TrendingUp, Sparkles, Heart } from 'lucide-react';

interface Props {
  entries: DiaryEntry[];
}

export const EmotionStats: React.FC<Props> = ({ entries }) => {
  const total = entries.length;

  const counts: Record<EmotionType, number> = {
    joy: entries.filter((e) => e.emotion === 'joy').length,
    tired: entries.filter((e) => e.emotion === 'tired').length,
    flutter: entries.filter((e) => e.emotion === 'flutter').length,
    anxious: entries.filter((e) => e.emotion === 'anxious').length,
  };

  const completedActions = entries.filter((e) => e.actionCompleted).length;
  const actionRate = total > 0 ? Math.round((completedActions / total) * 100) : 0;

  // Find dominant emotion
  const sortedEmotions = (Object.keys(counts) as EmotionType[]).sort((a, b) => counts[b] - counts[a]);
  const dominantEmotion = sortedEmotions[0];

  const getEncouragingMessage = () => {
    if (total === 0) {
      return '일기를 작성하면 당신의 마음 날씨와 긍정 실천 통계가 여기에 차곡차곡 쌓여요.';
    }
    if (dominantEmotion === 'joy') {
      return '최근 기쁨과 감사의 날들이 많았군요! 이 따뜻한 온기가 마음 깊은 곳에 든든한 힘이 되어줄 거예요.';
    }
    if (dominantEmotion === 'tired') {
      return '쉼이 필요한 지친 날들이 많았네요. 어떤 일도 하지 않고 오롯이 나만을 위한 따뜻한 휴식을 챙겨주세요.';
    }
    if (dominantEmotion === 'anxious') {
      return '불안과 걱정이 많았던 날들이었군요. 불안은 내가 더 잘해내고 싶다는 소중한 마음의 반증이기도 해요. 천천히 숨을 고르고 나아가요.';
    }
    return '설렘과 새로운 기대가 가득한 날들을 보내고 계시네요! 두근거리는 발걸음을 계속 응원합니다.';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Summary Banner */}
      <div className="bg-[#FFFCF7] p-6 sm:p-8 rounded-3xl border border-amber-200/60 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              마음 날씨 리포트
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">
              {total > 0 ? `지금까지 ${total}번의 하루를 기록했어요` : '아직 기록된 일기가 없어요'}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-serif max-w-xl">
              {getEncouragingMessage()}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-amber-50 border border-amber-200/60 p-2 shrink-0">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-400 mb-1" />
            <span className="text-[10px] text-stone-500 font-medium">총 일기 수</span>
            <span className="text-xl font-bold text-stone-800">{total}편</span>
          </div>
        </div>
      </div>

      {/* Grid: Emotion Distribution & Action Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emotion Distribution */}
        <div className="bg-[#FFFCF7] p-6 rounded-3xl border border-stone-200/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-800 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>감정 분포 (기쁨 • 지침 • 설렘 • 불안)</span>
            </h4>
            <span className="text-xs text-stone-400">전체 {total}건</span>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(EMOTIONS) as EmotionType[]).map((type) => {
              const emo = EMOTIONS[type];
              const count = counts[type];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 flex items-center gap-1.5">
                      <span>{emo.emoji}</span>
                      <span>{emo.label}</span>
                    </span>
                    <span className="text-stone-500 font-semibold">
                      {count}회 ({pct}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: emo.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tomorrow's Action Completion Card */}
        <div className="bg-[#FFFCF7] p-6 rounded-3xl border border-stone-200/70 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-stone-800 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>내일을 위한 작은 실천 달성률</span>
              </h4>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {actionRate}% 달성
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              AI 비서가 제안한 내일의 작은 긍정 행동들을 실천해보셨나요?
              완료 표시를 누르면 실천 달성률이 쑥쑥 올라가요.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-around text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-800">{completedActions}</span>
                <p className="text-[11px] text-stone-500 mt-0.5">실천 완료</p>
              </div>
              <div className="w-px h-8 bg-emerald-200" />
              <div>
                <span className="text-2xl font-bold text-stone-700">{total - completedActions}</span>
                <p className="text-[11px] text-stone-500 mt-0.5">실천 예정/진행</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 italic">
            🌱 "작은 실천 하나가 모여 내일을 더 눈부시게 만듭니다."
          </div>
        </div>
      </div>
    </div>
  );
};
