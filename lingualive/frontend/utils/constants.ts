// Dynamically determine WebSocket URL based on browser location
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  }
  
  // Use the same host as the browser is using
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  return `${protocol}//${host}:3001`;
}

export const WS_URL = getWebSocketUrl();

// Debug: log the WebSocket URL on load
if (typeof window !== 'undefined') {
  console.log('[LinguaLive] WebSocket URL:', WS_URL);
}

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
