/**
 * Speechmatics Real-time Transcription Service
 * Handles WebSocket connection to Speechmatics RT API for live speech-to-text
 * @module services/speechmatics-service
 */

import WebSocket from 'ws';
import { logger } from '../utils/logger.js';

const SPEECHMATICS_RT_URL = 'wss://eu.rt.speechmatics.com/v2';

/** Callback function for transcript updates */
interface TranscriptCallback {
  (text: string, isFinal: boolean): void;
}

/**
 * Speechmatics Real-time Transcription Service
 * Manages WebSocket connection and audio streaming to Speechmatics API
 */
export class SpeechmaticsService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private onTranscript: TranscriptCallback;
  public connected = false;
  private log = logger.child({ service: 'SpeechmaticsService' });

  /**
   * Creates a new Speechmatics service instance
   * @param apiKey - Speechmatics API key
   * @param onTranscript - Callback for transcript updates
   */
  constructor(apiKey: string, onTranscript: TranscriptCallback) {
    this.apiKey = apiKey;
    this.onTranscript = onTranscript;
  }

  /**
   * Establishes WebSocket connection to Speechmatics RT API
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${SPEECHMATICS_RT_URL}?auth_token=${this.apiKey}`;
        
        this.log.info('Connecting to Speechmatics RT API', { url: SPEECHMATICS_RT_URL });
        
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          this.connected = true;
          this.log.info('Connected to Speechmatics');
          
          // Send StartRecognition message
          this.sendMessage({
            type: 'StartRecognition',
            transcription_config: {
              language: 'en',
              operating_point: 'standard',
              max_delay: 5.0,
            },
          });
          
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            this.log.error('Failed to parse Speechmatics message', {
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        });

        this.ws.on('error', (error: Error) => {
          this.connected = false;
          this.log.error('WebSocket error', { error: error.message });
          reject(error);
        });

        this.ws.on('close', (code: number, reason: string) => {
          this.connected = false;
          this.log.info('Disconnected from Speechmatics', { code, reason });
        });
      } catch (error) {
        this.connected = false;
        this.log.error('Failed to create WebSocket', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        reject(error);
      }
    });
  }

  /**
   * Sends audio data to Speechmatics for transcription
   * @param audioBuffer - PCM 16-bit audio data
   */
  sendAudio(audioBuffer: Buffer): void {
    if (!this.connected || !this.ws) {
      this.log.warn('Cannot send audio - not connected');
      return;
    }

    try {
      // Send AddAudio message with base64 encoded audio
      const message = {
        type: 'AddAudio',
        audio: audioBuffer.toString('base64'),
      };
      
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      this.log.error('Failed to send audio', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handles incoming messages from Speechmatics
   * @param message - Parsed message from Speechmatics
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'RecognitionStarted':
        this.log.info('Recognition started');
        break;

      case 'AddAudioStatus':
        if (message.error) {
          this.log.error('Audio error', { error: message.error });
        }
        break;

      case 'RecognitionResult':
        this.handleRecognitionResult(message);
        break;

      case 'EndOfStream':
        this.log.info('End of stream reached');
        break;

      case 'Error':
        this.log.error('Speechmatics error', {
          error: message.error,
          reason: message.reason,
        });
        break;

      default:
        this.log.debug('Unknown message type', { type: message.type });
    }
  }

  /**
   * Processes recognition results from Speechmatics
   * @param message - RecognitionResult message
   */
  private handleRecognitionResult(message: any): void {
    try {
      const results = message.results || [];
      
      if (results.length === 0) return;

      // Get the last result (most recent)
      const lastResult = results[results.length - 1];
      
      // Extract transcript from alternatives
      if (lastResult.alternatives && lastResult.alternatives.length > 0) {
        const transcript = lastResult.alternatives[0].transcript;
        const isFinal = !message.is_final ? false : true;

        this.log.debug('Transcript received', {
          text: transcript.substring(0, 50),
          isFinal,
        });

        // Call the callback with transcript
        this.onTranscript(transcript, isFinal);
      }
    } catch (error) {
      this.log.error('Failed to process recognition result', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Sends a message to Speechmatics
   * @param message - Message object to send
   */
  private sendMessage(message: any): void {
    if (!this.connected || !this.ws) {
      this.log.warn('Cannot send message - not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      this.log.error('Failed to send message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Gracefully disconnects from Speechmatics
   */
  disconnect(): void {
    if (this.ws) {
      try {
        // Send EndAudio message to signal end of stream
        this.sendMessage({ type: 'EndAudio' });
        
        // Close WebSocket after a short delay
        setTimeout(() => {
          if (this.ws) {
            this.ws.close(1000, 'Normal closure');
            this.ws = null;
          }
        }, 100);
      } catch (error) {
        this.log.error('Error during disconnect', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.ws = null;
      }
    }
    this.connected = false;
  }
}
