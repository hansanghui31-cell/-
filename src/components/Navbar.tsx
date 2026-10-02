import React from 'react';
import { PenLine, BookHeart, BarChart3, HelpCircle, Sparkles } from 'lucide-react';

interface Props {
  activeTab: 'write' | 'list' | 'stats';
  onSelectTab: (tab: 'write' | 'list' | 'stats') => void;
  onOpenGuide: () => void;
  entryCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenGuide,
  entryCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-amber-200/60 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('write')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-400 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ☕
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base sm:text-lg text-stone-800 tracking-tight font-serif flex items-center gap-1">
                따뜻한 하루 일기
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              </h1>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              Google Gemini AI의 다정한 위로와 내일의 응원
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-stone-200/50 p-1 rounded-2xl border border-stone-200/60">
          <button
            type="button"
            onClick={() => onSelectTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'write'
                ? 'bg-white text-stone-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <PenLine className="w-3.5 h-3.5 text-amber-600" />
            <span>일기 쓰기</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-stone-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <BookHeart className="w-3.5 h-3.5 text-rose-500" />
            <span>일기 서재</span>
            {entryCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                {entryCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white text-stone-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>마음 통계</span>
          </button>
        </div>

        {/* Guide button */}
        <button
          type="button"
          onClick={onOpenGuide}
          title="Vercel 배포 & API 보안 가이드"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 bg-white/70 hover:bg-white border border-stone-200 cursor-pointer transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>배포 &amp; 보안 안내</span>
        </button>
      </div>
    </header>
  );
};
