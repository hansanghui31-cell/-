/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DiaryEntry } from './types';
import { Navbar } from './components/Navbar';
import { DiaryForm } from './components/DiaryForm';
import { AIResponseCard } from './components/AIResponseCard';
import { DiaryList } from './components/DiaryList';
import { EmotionStats } from './components/EmotionStats';
import { VercelGuideModal } from './components/VercelGuideModal';
import { fetchDiaryEntries, toggleActionStatus, removeDiaryEntry } from './lib/firebase';
import { Sparkles, Database, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'list' | 'stats'>('write');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [latestSavedEntry, setLatestSavedEntry] = useState<DiaryEntry | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [dbSource, setDbSource] = useState<'firestore' | 'local'>('firestore');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load diary entries on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { entries: data, source } = await fetchDiaryEntries();
        setEntries(data);
        setDbSource(source);
      } catch (err) {
        console.error('Failed to load diaries:', err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const handleSaved = (entry: DiaryEntry) => {
    setEntries((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)]);
    setLatestSavedEntry(entry);
    // Stay on 'write' view to display the heartfelt AIResponseCard
  };

  const handleToggleAction = async (id: string, completed: boolean) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, actionCompleted: completed } : e))
    );
    if (latestSavedEntry && latestSavedEntry.id === id) {
      setLatestSavedEntry((prev) =>
        prev ? { ...prev, actionCompleted: completed } : null
      );
    }
    await toggleActionStatus(id, completed);
  };

  const handleDelete = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (latestSavedEntry && latestSavedEntry.id === id) {
      setLatestSavedEntry(null);
    }
    await removeDiaryEntry(id);
  };

  const handleWriteNew = () => {
    setLatestSavedEntry(null);
    setActiveTab('write');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'write' && latestSavedEntry) {
            // keep response view or reset as desired
          }
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        entryCount={entries.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Warm Greeting Banner for 'write' tab */}
        {activeTab === 'write' && !latestSavedEntry && (
          <div className="text-center space-y-2 py-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-900 text-xs font-semibold border border-amber-200/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              오늘 하루도 참 애쓰셨어요
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight font-serif">
              당신의 하루와 마음에 귀 기울입니다
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
              오늘 느낀 감정을 고르고 일기를 남겨보세요.
              Google Gemini AI 비서가 따뜻한 위로의 편지와 내일을 위한 작은 실천을 건넵니다.
            </p>
          </div>
        )}

        {/* Tab 1: Write Diary or View Recently Received AI Response */}
        {activeTab === 'write' && (
          <>
            {latestSavedEntry && latestSavedEntry.aiResponse ? (
              <div className="space-y-6">
                <AIResponseCard
                  aiResponse={latestSavedEntry.aiResponse}
                  emotion={latestSavedEntry.emotion}
                  diaryContent={latestSavedEntry.content}
                  date={latestSavedEntry.date}
                  isActionCompleted={latestSavedEntry.actionCompleted}
                  onToggleAction={(completed) =>
                    handleToggleAction(latestSavedEntry.id, completed)
                  }
                  onNewDiary={handleWriteNew}
                />
              </div>
            ) : (
              <DiaryForm
                onSaved={handleSaved}
                onOpenGuide={() => setIsGuideOpen(true)}
              />
            )}
          </>
        )}

        {/* Tab 2: Diary Archive / Library */}
        {activeTab === 'list' && (
          <DiaryList
            entries={entries}
            onDelete={handleDelete}
            onToggleAction={handleToggleAction}
            onWriteNew={handleWriteNew}
          />
        )}

        {/* Tab 3: Emotion Stats & Mind Weather */}
        {activeTab === 'stats' && <EmotionStats entries={entries} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/70 bg-[#F4F1EC] py-6 px-4 text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              따뜻한 하루 일기
            </span>
            <span>• Powered by Google Gemini AI</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Database indicator */}
            <span className="flex items-center gap-1.5 text-stone-600 bg-white/70 px-2.5 py-1 rounded-full border border-stone-200">
              <Database className="w-3 h-3 text-amber-600" />
              <span>Firebase: visit-208b9 ({dbSource === 'firestore' ? '클라우드 동기화' : '로컬 캐시'})</span>
            </span>

            {/* Guide modal link */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1 hover:text-stone-800 underline hover:no-underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vercel 배포 &amp; 보안 안내</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Guide Modal */}
      <VercelGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
