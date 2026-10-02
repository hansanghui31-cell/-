export type EmotionType = 'joy' | 'tired' | 'flutter' | 'anxious';

export interface EmotionInfo {
  type: EmotionType;
  label: string;
  emoji: string;
  tagline: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentBg: string;
}

export interface AIEncouragement {
  warmTitle: string;
  comfortMessage: string;
  tomorrowAction: string;
  warmQuote: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  authorName: string;
  emotion: EmotionType;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'starry';
  title?: string;
  content: string;
  aiResponse?: AIEncouragement;
  actionCompleted?: boolean;
  createdAt: number;
}
