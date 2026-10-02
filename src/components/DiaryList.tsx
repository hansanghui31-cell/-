import React, { useState } from 'react';
import { Search, Calendar, Trash2, CheckCircle2, Circle, Heart, ArrowUpRight, X } from 'lucide-react';
import { DiaryEntry, EmotionType } from '../types';
import { EMOTIONS } from '../constants/emotions';
import { AIResponseCard } from './AIResponseCard';

interface Props {
  entries: DiaryEntry[];
  onDelete: (id: string) => void;
  onToggleAction: (id: string, completed: boolean) => void;
  onWriteNew: () => void;
}

export const DiaryList: React.FC<Props> = ({
  entries,
  onDelete,
  onToggleAction,
  onWriteNew,
}) => {
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (filterEmotion !== 'all' && entry.emotion !== filterEmotion) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentMatch = entry.content.toLowerCase().includes(q);
      const titleMatch = entry.title?.toLowerCase().includes(q);
      const aiMatch = entry.aiResponse?.comfortMessage.toLowerCase().includes(q) ||
                      entry.aiResponse?.tomorrowAction.toLowerCase().includes(q);
      return contentMatch || titleMatch || aiMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header controls: Search & Emotion filter */}
      <div className="bg-[#FFFCF7] p-5 rounded-3xl border border-amber-200/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="일기 내용, AI 답장, 실천 키워드 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          <div className="text-xs text-stone-500 font-medium shrink-0 self-end sm:self-center">
            총 <span className="font-bold text-amber-700">{filteredEntries.length}</span>편의 이야기
          </div>
        </div>

        {/* Emotion Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterEmotion('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer border ${
              filterEmotion === 'all'
                ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            전체 보기 ({entries.length})
          </button>

          {(Object.keys(EMOTIONS) as EmotionType[]).map((type) => {
            const count = entries.filter((e) => e.emotion === type).length;
            const emo = EMOTIONS[type];
            const active = filterEmotion === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilterEmotion(type)}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
                  active
                    ? `${emo.accentBg} border-amber-300 font-bold shadow-xs`
                    : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                <span>{emo.emoji}</span>
                <span>{emo.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Diary Card Grid or Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="bg-[#FFFCF7] rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 text-2xl flex items-center justify-center border border-amber-100">
            📖
          </div>
          <div>
            <h4 className="font-bold text-stone-700 text-base">아직 기록된 일기가 없어요</h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? '검색어와 일치하는 일기를 찾을 수 없습니다.'
                : '오늘 하루의 소중한 감정을 솔직하게 적고, 다정한 AI 비서의 응원을 받아보세요.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onWriteNew}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer transition-colors"
          >
            첫 일기 쓰러 가기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const emo = EMOTIONS[entry.emotion] || EMOTIONS.joy;

            return (
              <div
                key={entry.id}
                className="group relative bg-[#FFFCF7] hover:bg-white rounded-3xl p-5 border border-stone-200/80 hover:border-amber-300/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${emo.accentBg}`}>
                      <span>{emo.emoji}</span>
                      <span>{emo.label}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.date}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('이 일기를 정말 삭제하시겠습니까?')) {
                            onDelete(entry.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-500 transition-opacity cursor-pointer rounded-md hover:bg-stone-100"
                        title="일기 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title / Header */}
                  <h4 className="font-bold text-stone-800 text-base mb-1.5 font-serif line-clamp-1">
                    {entry.title || entry.aiResponse?.warmTitle || `${entry.date}의 기록`}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-4">
                    {entry.content}
                  </p>
                </div>

                {/* AI Response Preview Snippet */}
                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  {entry.aiResponse ? (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                        <span>💌 AI 비서의 한마디:</span>
                      </div>
                      <p className="text-xs text-stone-700 font-serif italic line-clamp-2">
                        "{entry.aiResponse.warmQuote || entry.aiResponse.comfortMessage}"
                      </p>

                      {/* Tomorrow's Action Item */}
                      {entry.aiResponse.tomorrowAction && (
                        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] border-t border-amber-200/40">
                          <span className="text-stone-600 truncate flex items-center gap-1">
                            <span>🌱</span>
                            <span className="truncate">{entry.aiResponse.tomorrowAction}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleAction(entry.id, !entry.actionCompleted);
                            }}
                            className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold cursor-pointer border ${
                              entry.actionCompleted
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-300'
                            }`}
                          >
                            {entry.actionCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>완료</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3 h-3 text-stone-400" />
                                <span>실천 전</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">
                      AI 비서의 답장이 아직 기록되지 않았습니다.
                    </div>
                  )}

                  {/* Open details button */}
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-amber-100/60 text-stone-700 hover:text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>답장 & 일기 전문 펼쳐보기</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-stone-300 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedEntry.date}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500">작성자: {selectedEntry.authorName}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-800 font-serif">
                {selectedEntry.title || `${selectedEntry.date}의 일기`}
              </h3>
            </div>

            {/* Original diary content */}
            <div className="space-y-2 mb-6">
              <h5 className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                내가 쓴 일기 내용
              </h5>
              <div className="p-5 rounded-2xl bg-white border border-stone-200 text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
                {selectedEntry.content}
              </div>
            </div>

            {/* AI Response Card */}
            {selectedEntry.aiResponse && (
              <AIResponseCard
                aiResponse={selectedEntry.aiResponse}
                emotion={selectedEntry.emotion}
                diaryContent={selectedEntry.content}
                date={selectedEntry.date}
                isActionCompleted={selectedEntry.actionCompleted}
                onToggleAction={(completed) => {
                  onToggleAction(selectedEntry.id, completed);
                  setSelectedEntry(prev => prev ? { ...prev, actionCompleted: completed } : null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
