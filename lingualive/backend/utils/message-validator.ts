const WS_EVENTS = {
  AUDIO_DATA: 'AUDIO_DATA',
  CAPTION_UPDATE: 'CAPTION_UPDATE',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  SPEAKER_START: 'SPEAKER_START',
  SPEAKER_STOP: 'SPEAKER_STOP',
  ERROR: 'ERROR',
} as const;

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'zh'] as const;
type LanguageCode = typeof SUPPORTED_LANGUAGES[number];

interface WSMessage {
  type: string;
  timestamp: number;
  data?: string;
  language?: LanguageCode;
}

const validEventTypes = Object.values(WS_EVENTS);

export function validateMessage(data: unknown): WSMessage | null {
  if (!data || typeof data !== 'object') return null;
  
  const msg = data as Record<string, unknown>;
  
  if (!msg.type || typeof msg.type !== 'string') return null;
  if (!validEventTypes.includes(msg.type as typeof WS_EVENTS[keyof typeof WS_EVENTS])) return null;
  
  // Add timestamp if missing (for backwards compatibility)
  if (!msg.timestamp || typeof msg.timestamp !== 'number') {
    msg.timestamp = Date.now();
  }
  
  switch (msg.type) {
    case WS_EVENTS.AUDIO_DATA:
      if (typeof msg.data !== 'string') return null;
      if (msg.data.length > 1024 * 1024) return null; // Max 1MB
      break;
      
    case WS_EVENTS.LANGUAGE_SELECT:
      if (!msg.language || !isValidLanguage(msg.language as string)) return null;
      break;
      
    case WS_EVENTS.SPEAKER_START:
    case WS_EVENTS.SPEAKER_STOP:
      break;
      
    default:
      return null;
  }
  
  return {
    ...msg,
    timestamp: msg.timestamp as number,
  } as WSMessage;
}

function isValidLanguage(lang: string): lang is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(lang as LanguageCode);
}
