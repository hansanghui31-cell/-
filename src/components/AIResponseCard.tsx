import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Copy, Check, Heart, ArrowRight, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AIEncouragement, EmotionType } from '../types';
import { EMOTIONS } from '../constants/emotions';

interface Props {
  aiResponse: AIEncouragement;
  emotion: EmotionType;
  diaryContent: string;
  date: string;
  isActionCompleted?: boolean;
  onToggleAction?: (completed: boolean) => void;
  onNewDiary?: () => void;
}

export const AIResponseCard: React.FC<Props> = ({
  aiResponse,
  emotion,
  diaryContent,
  date,
  isActionCompleted = false,
  onToggleAction,
  onNewDiary,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [actionDone, setActionDone] = useState(isActionCompleted);

  const emotionInfo = EMOTIONS[emotion] || EMOTIONS.joy;

  // Trigger gentle confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#F43F5E', '#10B981', '#6366F1', '#EC4899'],
      disableForReducedMotion: true,
    });
  }, []);

  const handleToggle = () => {
    const nextState = !actionDone;
    setActionDone(nextState);
    if (onToggleAction) {
      onToggleAction(nextState);
    }
    if (nextState) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#10B981', '#F59E0B'],
      });
    }
  };

  const handleCopy = async () => {
    const textToCopy = `[따뜻한 하루 일기 - AI의 답장]\n제목: ${aiResponse.warmTitle}\n\n${aiResponse.comfortMessage}\n\n🌱 내일을 위한 실천: ${aiResponse.tomorrowAction}\n\n✨ 오늘의 한마디: "${aiResponse.warmQuote}"`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('사용하시는 브라우저에서는 음성 읽기 기능을 지원하지 않습니다.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `${aiResponse.warmTitle}. ${aiResponse.comfortMessage}. 내일을 위한 작은 실천은, ${aiResponse.tomorrowAction} 입니다.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92; // Slightly calm and gentle pace
    utterance.pitch = 1.05;

    // Pick Korean voice if available
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(v => v.lang.includes('ko') || v.lang.includes('KO'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Decorative Warm Letter Container */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] border border-amber-200/70 shadow-xl overflow-hidden p-6 sm:p-8">
        {/* Soft background watermark/accent */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-amber-100/40 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-rose-100/30 blur-2xl pointer-events-none" />

        {/* Letter Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-amber-200/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 text-xl border border-amber-200/60 shadow-xs">
              💌
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 border border-amber-200/50">
                  AI 비서의 따뜻한 답장
                </span>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-800 mt-1 font-serif">
                {aiResponse.warmTitle}
              </h3>
            </div>
          </div>

          {/* Action buttons (TTS & Copy) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeech}
              title={isPlayingAudio ? '음성 중지' : '다정한 목소리로 듣기'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-white/80 hover:bg-stone-50 text-stone-600 border-stone-200/70'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>읽기 멈춤</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>소리로 듣기</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              title="편지 복사하기"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 hover:bg-stone-50 text-stone-600 border border-stone-200/70 cursor-pointer transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Emotion reflection tag */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-stone-500">당신이 남겨준 오늘의 마음:</span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.8 rounded-full ${emotionInfo.accentBg}`}>
            <span>{emotionInfo.emoji}</span>
            <span>{emotionInfo.label}</span>
          </span>
        </div>

        {/* Comfort Message Letter Body */}
        <div className="relative mt-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-amber-100 shadow-xs leading-relaxed text-stone-700 text-base sm:text-lg whitespace-pre-line font-serif">
            {aiResponse.comfortMessage}
          </div>
        </div>

        {/* Tomorrow's Action Suggestion (핵심 기능 2) */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-stone-50 border border-emerald-200/80 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                  🌱
                </span>
                <span className="text-xs font-bold tracking-wide uppercase text-emerald-800">
                  내일을 위한 작은 긍정 행동 제안
                </span>
              </div>
              <p className="text-stone-800 font-semibold text-base sm:text-lg pl-8">
                {aiResponse.tomorrowAction}
              </p>
              <p className="text-xs text-stone-500 pl-8">
                거창하지 않아도 괜찮아요. 내일 나 자신을 위해 가볍게 건네는 선물입니다.
              </p>
            </div>

            {/* Checkbox button */}
            <button
              type="button"
              onClick={handleToggle}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                actionDone
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${actionDone ? 'text-white' : 'text-emerald-500'}`} />
              <span>{actionDone ? '실천 완료! 👏' : '내일 실천 약속'}</span>
            </button>
          </div>
        </div>

        {/* Warm Quote */}
        {aiResponse.warmQuote && (
          <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-200/50 text-amber-900/90">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium italic">
              "{aiResponse.warmQuote}"
            </p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-amber-200/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>이 편지는 언제든 '일기장 서재'에서 다시 꺼내볼 수 있어요.</span>
          </div>

          {onNewDiary && (
            <button
              type="button"
              onClick={onNewDiary}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-900 text-white shadow-xs cursor-pointer transition-colors"
            >
              <span>새 일기 작성하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
