import WebSocket from 'ws';
import { ConnectionManager } from './connection-manager.js';
import { SpeechmaticsService } from '../services/speechmatics-service.js';
import { TranslationService } from '../services/translation-service.js';

const WS_EVENTS = {
  AUDIO_DATA: 'AUDIO_DATA',
  CAPTION_UPDATE: 'CAPTION_UPDATE',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  SPEAKER_START: 'SPEAKER_START',
  SPEAKER_STOP: 'SPEAKER_STOP',
  ERROR: 'ERROR',
} as const;

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh';

interface WSMessage {
  type: string;
  timestamp: number;
  data?: string;
  language?: LanguageCode;
}

export class MessageHandler {
  private connectionManager: ConnectionManager;
  private translationService: TranslationService;
  private speechmaticsService: SpeechmaticsService | null = null;

  constructor(connectionManager: ConnectionManager, translationService: TranslationService) {
    this.connectionManager = connectionManager;
    this.translationService = translationService;
  }

  async handleMessage(ws: WebSocket, message: WSMessage): Promise<void> {
    const client = this.connectionManager.getClient(ws);
    if (!client) return;

    switch (message.type) {
      case WS_EVENTS.SPEAKER_START:
        if (client.role === 'speaker') {
          await this.startSpeaking();
        }
        break;

      case WS_EVENTS.SPEAKER_STOP:
        if (client.role === 'speaker') {
          this.stopSpeaking();
        }
        break;

      case WS_EVENTS.AUDIO_DATA:
        if (client.role === 'speaker' && message.data) {
          this.handleAudioData(message.data);
        }
        break;

      case WS_EVENTS.LANGUAGE_SELECT:
        if (client.role === 'viewer' && message.language) {
          console.log(`Viewer ${client.id} selected language: ${message.language}`);
          this.connectionManager.updateClientLanguage(ws, message.language);
        }
        break;
    }
  }

  private async startSpeaking(): Promise<void> {
    const apiKey = process.env.SPEECHMATICS_API_KEY;
    
    if (!apiKey) {
      console.warn('Speechmatics API key not configured, using mock transcription');
      return;
    }

    this.speechmaticsService = new SpeechmaticsService(apiKey, async (text, isFinal) => {
      await this.handleTranscript(text, isFinal);
    });

    try {
      await this.speechmaticsService.connect();
      console.log('Speechmatics connected');
    } catch (error) {
      console.error('Failed to connect to Speechmatics:', error);
    }
  }

  private stopSpeaking(): void {
    this.speechmaticsService?.disconnect();
    this.speechmaticsService = null;
    console.log('Speechmatics disconnected');
  }

  private handleAudioData(base64Audio: string): void {
    if (this.speechmaticsService?.connected) {
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      this.speechmaticsService.sendAudio(audioBuffer);
    }
    // No mock transcription - requires real Speechmatics connection
  }

  private async handleTranscript(text: string, isFinal: boolean): Promise<void> {
    const viewersByLang = this.connectionManager.getViewersByLanguage();
    const languages = Array.from(viewersByLang.keys());
    
    // Always include English (source language)
    if (!languages.includes('en')) {
      languages.push('en');
    }

    // Translate to all needed languages
    const translations = await this.translationService.translateBatch(
      text,
      languages as LanguageCode[]
    );

    // Broadcast to viewers in their language
    for (const [lang, translated] of translations) {
      this.connectionManager.broadcastCaption(translated, lang, isFinal);
    }
  }

  cleanup(): void {
    this.stopSpeaking();
  }
}
