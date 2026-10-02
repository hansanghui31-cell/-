import React, { useState } from 'react';
import { Sparkles, Calendar, User, BookOpen, PenLine, AlertCircle } from 'lucide-react';
import { EmotionType, DiaryEntry, AIEncouragement } from '../types';
import { EmotionSelector } from './EmotionSelector';
import { WEATHER_OPTIONS } from '../constants/emotions';
import { requestAIEncouragement } from '../lib/gemini';
import { createDiaryEntry } from '../lib/firebase';

interface Props {
  onSaved: (entry: DiaryEntry) => void;
  onOpenGuide: () => void;
}

const INSPIRATIONAL_PROMPTS = [
  '오늘 나를 미소 짓게 한 작은 순간은?',
  '마음이 무거웠다면, 어떤 일이 나를 힘들게 했나요?',
  '오늘 하루 열심히 버텨낸 나에게 건네고 싶은 말',
  '내일 맞이하고 싶은 기분 좋은 아침의 풍경',
];

export const DiaryForm: React.FC<Props> = ({ onSaved, onOpenGuide }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('joy');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [authorName, setAuthorName] = useState('나');
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'starry'>('sunny');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('오늘 하루의 일기 내용을 조금이라도 적어주세요. 짧은 한 줄도 좋아요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call Gemini AI API for warm comfort and tomorrow's positive action
      const aiResponse: AIEncouragement = await requestAIEncouragement({
        emotion: selectedEmotion,
        diaryContent: content.trim(),
        date,
        authorName: authorName.trim() || '나',
      });

      // 2. Persist to Firebase Firestore & local storage
      const savedEntry = await createDiaryEntry({
        date,
        authorName: authorName.trim() || '나',
        emotion: selectedEmotion,
        weather,
        title: title.trim() || undefined,
        content: content.trim(),
        aiResponse,
        actionCompleted: false,
        createdAt: Date.now(),
      });

      onSaved(savedEntry);
    } catch (err: any) {
      console.error('Error submitting diary:', err);
      const msg = err.message || '일기를 분석하고 응답을 받는 도중 문제가 발생했습니다.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPrompt = (promptText: string) => {
    if (content.length > 0) {
      setContent(prev => `${prev}\n\n[생각거리: ${promptText}]\n`);
    } else {
      setContent(`[생각거리: ${promptText}]\n`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Main Paper Card */}
      <div className="bg-[#FFFCF7] rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-lg shadow-amber-950/5 relative overflow-hidden">
        {/* Subtle top warm bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-500" />

        {/* Diary Top Meta (Date, Weather, Author) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-6 border-b border-stone-200/60">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>날짜</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Weather Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-500">
              오늘의 하늘 날씨
            </label>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.type}
                  type="button"
                  onClick={() => setWeather(w.type)}
                  title={w.label}
                  className={`flex-1 py-1 text-sm rounded-lg transition-colors cursor-pointer ${
                    weather === w.type
                      ? 'bg-amber-100/80 shadow-xs'
                      : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  {w.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>작성자 별칭</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="예: 나, 별이, 민서"
              maxLength={12}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        </div>

        {/* Emotion Selector Section (핵심 기능 1: 기쁨, 지침, 설렘, 불안) */}
        <div className="mt-6">
          <EmotionSelector
            selectedEmotion={selectedEmotion}
            onChange={setSelectedEmotion}
          />
        </div>

        {/* Diary Title & Content Section */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
              <PenLine className="w-4 h-4 text-amber-600" />
              <span>오늘 있었던 일과 마음 기록하기</span>
            </label>
            <span className="text-xs text-stone-400">
              {content.length}자
            </span>
          </div>

          {/* Optional Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일기 제목 (선택: 비워두면 AI가 예쁜 제목을 지어줘요)"
            maxLength={50}
            className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-stone-200/90 text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />

          {/* Main Textarea with gentle ruled-notebook styling */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="오늘 하루 어떤 일이 있었나요? 
남들에게 말하기 어려웠던 솔직한 감정, 소소하게 기뻤던 순간, 지치고 불안했던 마음까지 편안하게 적어보세요.
AI 비서가 따뜻한 위로와 내일을 위한 작은 응원을 선물해 드릴게요..."
              className="w-full p-4.5 rounded-2xl bg-white/95 border border-stone-200/90 text-stone-800 text-sm sm:text-base leading-relaxed placeholder:text-stone-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-shadow resize-y"
            />
          </div>

          {/* Thought Starter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-stone-400 shrink-0 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              생각 도우미:
            </span>
            {INSPIRATIONAL_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPrompt(prompt)}
                className="text-[11px] bg-stone-100 hover:bg-amber-100/70 text-stone-600 hover:text-amber-900 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-stone-200/60"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">응원 메시지를 받아오는 중 안내가 필요해요</p>
              <p className="text-rose-700/90 leading-relaxed">{errorMessage}</p>
              {errorMessage.includes('GEMINI_API_KEY') && (
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-900 underline hover:no-underline cursor-pointer"
                >
                  환경변수 및 Vercel 배포 가이드 확인하기 &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Prominent Action Button (핵심 기능 1의 지정된 버튼 명칭) */}
        <div className="mt-8 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg ${
              isLoading
                ? 'bg-amber-400 text-amber-950 cursor-wait opacity-90'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">
                  AI 비서가 일기를 읽고 따뜻한 답장을 적고 있어요...
                </span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                <span>[AI 비서에게 일기 보여주기]</span>
                <span className="text-xs font-normal text-amber-100 bg-amber-700/30 px-2 py-0.5 rounded-full border border-amber-300/30 hidden sm:inline">
                  Google Gemini 연동
                </span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-400 mt-2.5">
            작성하신 일기는 Firebase와 로컬 저장소에 안전하게 보관되며, AI가 다정한 위로와 내일의 작은 실천을 보내드립니다.
          </p>
        </div>
      </div>
    </form>
  );
};
