// WebSocket Event Names (UPPER_SNAKE_CASE)
export const WS_EVENTS = {
  AUDIO_DATA: 'AUDIO_DATA',
  CAPTION_UPDATE: 'CAPTION_UPDATE',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  SPEAKER_START: 'SPEAKER_START',
  SPEAKER_STOP: 'SPEAKER_STOP',
  ERROR: 'ERROR',
} as const;

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese (Simplified)',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// WebSocket message types
export interface BaseMessage {
  type: string;
  timestamp: number;
}

export interface AudioDataMessage extends BaseMessage {
  type: typeof WS_EVENTS.AUDIO_DATA;
  data: string; // Base64 encoded audio
}

export interface CaptionUpdateMessage extends BaseMessage {
  type: typeof WS_EVENTS.CAPTION_UPDATE;
  text: string;
  language: LanguageCode;
  isFinal: boolean;
}

export interface LanguageSelectMessage extends BaseMessage {
  type: typeof WS_EVENTS.LANGUAGE_SELECT;
  language: LanguageCode;
}

export interface ConnectionStatusMessage extends BaseMessage {
  type: typeof WS_EVENTS.CONNECTION_STATUS;
  status: 'connected' | 'disconnected' | 'speaking' | 'idle';
  viewerCount?: number;
}

export interface SpeakerControlMessage extends BaseMessage {
  type: typeof WS_EVENTS.SPEAKER_START | typeof WS_EVENTS.SPEAKER_STOP;
}

export interface ErrorMessage extends BaseMessage {
  type: typeof WS_EVENTS.ERROR;
  message: string;
  code?: string;
}

export type WSMessage =
  | AudioDataMessage
  | CaptionUpdateMessage
  | LanguageSelectMessage
  | ConnectionStatusMessage
  | SpeakerControlMessage
  | ErrorMessage;

// Client types
export type ClientRole = 'speaker' | 'viewer';

export interface Client {
  id: string;
  role: ClientRole;
  language: LanguageCode;
  connectedAt: number;
}
