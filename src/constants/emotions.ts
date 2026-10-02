import { EmotionInfo, EmotionType } from '../types';

export const EMOTIONS: Record<EmotionType, EmotionInfo> = {
  joy: {
    type: 'joy',
    label: '기쁨',
    emoji: '☀️',
    tagline: '행복하고 감사한 순간이 가득해요',
    color: '#D97706',
    bgGradient: 'from-amber-50 to-orange-50/50',
    borderColor: 'border-amber-200 hover:border-amber-400',
    textColor: 'text-amber-800',
    accentBg: 'bg-amber-100/80 text-amber-900',
  },
  tired: {
    type: 'tired',
    label: '지침',
    emoji: '🌙',
    tagline: '몸과 마음이 무겁고 푹 쉬고 싶어요',
    color: '#6366F1',
    bgGradient: 'from-indigo-50/70 to-slate-50',
    borderColor: 'border-indigo-200 hover:border-indigo-400',
    textColor: 'text-indigo-900',
    accentBg: 'bg-indigo-100/80 text-indigo-900',
  },
  flutter: {
    type: 'flutter',
    label: '설렘',
    emoji: '🌸',
    tagline: '가슴이 두근거리고 새로운 기대가 차올라요',
    color: '#DB2777',
    bgGradient: 'from-rose-50 to-pink-50/50',
    borderColor: 'border-rose-200 hover:border-rose-400',
    textColor: 'text-rose-800',
    accentBg: 'bg-rose-100/80 text-rose-900',
  },
  anxious: {
    type: 'anxious',
    label: '불안',
    emoji: '🌧️',
    tagline: '생각과 걱정이 많아 마음이 복잡해요',
    color: '#0D9488',
    bgGradient: 'from-teal-50/80 to-slate-50',
    borderColor: 'border-teal-200 hover:border-teal-400',
    textColor: 'text-teal-900',
    accentBg: 'bg-teal-100/80 text-teal-900',
  },
};

export const WEATHER_OPTIONS = [
  { type: 'sunny', label: '맑음', emoji: '☀️' },
  { type: 'cloudy', label: '구름 많음', emoji: '⛅' },
  { type: 'rainy', label: '비', emoji: '🌧️' },
  { type: 'snowy', label: '눈', emoji: '❄️' },
  { type: 'starry', label: '별밤', emoji: '✨' },
] as const;
