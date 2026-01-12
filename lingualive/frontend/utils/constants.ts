export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese (Simplified)',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const WS_EVENTS = {
  AUDIO_DATA: 'AUDIO_DATA',
  CAPTION_UPDATE: 'CAPTION_UPDATE',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  SPEAKER_START: 'SPEAKER_START',
  SPEAKER_STOP: 'SPEAKER_STOP',
  ERROR: 'ERROR',
} as const;
