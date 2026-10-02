import React from 'react';
import { EmotionType } from '../types';
import { EMOTIONS } from '../constants/emotions';

interface Props {
  selectedEmotion: EmotionType;
  onChange: (emotion: EmotionType) => void;
}

export const EmotionSelector: React.FC<Props> = ({ selectedEmotion, onChange }) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
          <span>오늘 내 마음의 날씨 (감정 선택)</span>
          <span className="text-xs font-normal text-stone-400">• 하나를 골라주세요</span>
        </label>
        <span className="text-xs text-amber-700/80 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
          {EMOTIONS[selectedEmotion].emoji} {EMOTIONS[selectedEmotion].label}을 느끼고 있어요
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(EMOTIONS) as EmotionType[]).map((type) => {
          const emotion = EMOTIONS[type];
          const isSelected = selectedEmotion === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`relative text-left p-3.5 rounded-2xl transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? `ring-2 ring-amber-500/50 shadow-md scale-[1.02] bg-gradient-to-br ${emotion.bgGradient} ${emotion.borderColor}`
                  : 'bg-white/80 hover:bg-stone-50/90 border-stone-200/70 hover:border-stone-300 shadow-xs'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
              <div className="text-2xl mb-1.5">{emotion.emoji}</div>
              <div className={`font-bold text-base ${isSelected ? emotion.textColor : 'text-stone-800'}`}>
                {emotion.label}
              </div>
              <p className="text-[11px] text-stone-500 leading-tight mt-1 line-clamp-2">
                {emotion.tagline}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
