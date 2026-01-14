/**
 * WebSocket Message Handler
 * Processes incoming WebSocket messages and coordinates between
 * speech recognition, translation, and client broadcasting.
 * @module ws/message-handler
 */

import WebSocket from 'ws';
import { ConnectionManager } from './connection-manager.js';
import { SpeechmaticsService } from '../services/speechmatics-service.js';
import { TranslationService } from '../services/translation-service.js';
import { logger } from '../utils/logger.js';

/** WebSocket event type constants */
const WS_EVENTS = {
  AUDIO_DATA: 'AUDIO_DATA',
  CAPTION_UPDATE: 'CAPTION_UPDATE',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  SPEAKER_START: 'SPEAKER_START',
  SPEAKER_STOP: 'SPEAKER_STOP',
  ERROR: 'ERROR',
} as const;

/** Supported language codes for translation */
type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh';

/** Structure of incoming WebSocket messages */
interface WSMessage {
  type: string;
  timestamp: number;
  data?: string;
  language?: LanguageCode;
}

/**
 * Handles WebSocket message routing and processing
 * Coordinates speech-to-text, translation, and caption broadcasting
 */
export class MessageHandler {
  private connectionManager: ConnectionManager;
  private translationService: TranslationService;
  private speechmaticsService: SpeechmaticsService | null = null;
  private log = logger.child({ service: 'MessageHandler' });

  /**
   * Creates a new MessageHandler instance
   * @param connectionManager - Manages WebSocket client connections
   * @param translationService - Handles text translation between languages
   */
  constructor(connectionManager: ConnectionManager, translationService: TranslationService) {
    this.connectionManager = connectionManager;
    this.translationService = translationService;
  }

  /**
   * Routes incoming WebSocket messages to appropriate handlers
   * @param ws - The WebSocket connection that sent the message
   * @param message - The parsed message object
   * @throws Logs error but does not throw to prevent connection drops
   */
  async handleMessage(ws: WebSocket, message: WSMessage): Promise<void> {
    const client = this.connectionManager.getClient(ws);
    if (!client) {
      this.log.warn('Message received from unknown client');
      return;
    }

    try {
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
            this.log.info('Viewer language changed', { 
              clientId: client.id, 
              language: message.language 
            });
            this.connectionManager.updateClientLanguage(ws, message.language);
          }
          break;

        default:
          this.log.warn('Unknown message type received', { type: message.type });
      }
    } catch (error) {
      this.log.error('Error handling message', {
        type: message.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Initializes speech recognition service and starts transcription
   * @throws Logs error if Speechmatics connection fails
   */
  private async startSpeaking(): Promise<void> {
    const apiKey = process.env.SPEECHMATICS_API_KEY;
    
    if (!apiKey) {
      this.log.warn('Speechmatics API key not configured');
      return;
    }

    this.speechmaticsService = new SpeechmaticsService(apiKey, async (text, isFinal) => {
      await this.handleTranscript(text, isFinal);
    });

    try {
      await this.speechmaticsService.connect();
      this.log.info('Speechmatics connected successfully');
    } catch (error) {
      this.log.error('Failed to connect to Speechmatics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Stops speech recognition and cleans up resources
   */
  private stopSpeaking(): void {
    this.speechmaticsService?.disconnect();
    this.speechmaticsService = null;
    this.log.info('Speechmatics disconnected');
  }

  /**
   * Processes incoming audio data and sends to speech recognition
   * @param base64Audio - Base64 encoded audio data from client
   */
  private handleAudioData(base64Audio: string): void {
    if (this.speechmaticsService?.connected) {
      try {
        const audioBuffer = Buffer.from(base64Audio, 'base64');
        this.speechmaticsService.sendAudio(audioBuffer);
      } catch (error) {
        this.log.error('Failed to process audio data', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  /**
   * Handles transcribed text by translating and broadcasting to viewers
   * @param text - The transcribed text from speech recognition
   * @param isFinal - Whether this is a final or interim transcript
   */
  private async handleTranscript(text: string, isFinal: boolean): Promise<void> {
    try {
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

      this.log.debug('Transcript broadcast complete', {
        text: text.substring(0, 50),
        languages: languages.length,
        isFinal,
      });
    } catch (error) {
      this.log.error('Failed to handle transcript', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Cleans up all resources when shutting down
   */
  cleanup(): void {
    this.stopSpeaking();
    this.log.info('MessageHandler cleanup complete');
  }
}
