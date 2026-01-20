/**
 * Speechmatics Real-time Transcription Service
 * Handles WebSocket connection to Speechmatics RT API for live speech-to-text
 * @module services/speechmatics-service
 */

import WebSocket from 'ws';
import https from 'https';
import { logger } from '../utils/logger.js';

const SPEECHMATICS_RT_URL = 'wss://eu.rt.speechmatics.com/v2';
const SPEECHMATICS_TOKEN_URL = 'https://mp.speechmatics.com/v1/api_keys?type=rt';

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
   * Generates a temporary JWT token for WebSocket connection
   * @returns Temporary JWT token valid for 60 seconds
   * @throws Error if token generation fails
   */
  private async generateTemporaryToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ ttl: 60 });

      const options = {
        hostname: 'mp.speechmatics.com',
        port: 443,
        path: '/v1/api_keys?type=rt',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Authorization': `Bearer ${this.apiKey}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            this.log.info('Token API response', { 
              statusCode: res.statusCode, 
              data: data.substring(0, 200) 
            });
            
            const response = JSON.parse(data);
            if (response.key_value) {
              this.log.info('Generated temporary token', { ttl: 60 });
              resolve(response.key_value);
            } else {
              this.log.error('Unexpected token response format', { response });
              reject(new Error('No key_value in response'));
            }
          } catch (error) {
            this.log.error('Failed to parse token response', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              data: data.substring(0, 200)
            });
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        this.log.error('Token generation error', { error: error.message });
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Establishes WebSocket connection to Speechmatics RT API
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Generate temporary token
        const token = await this.generateTemporaryToken();
        const url = `${SPEECHMATICS_RT_URL}?jwt=${token}`;
        
        this.log.info('Connecting to Speechmatics RT API', { url: SPEECHMATICS_RT_URL });
        
        this.ws = new WebSocket(url);

        this.ws.on('open', () => {
          this.connected = true;
          this.log.info('Connected to Speechmatics');
          
          // Send StartRecognition message with audio format
          this.sendMessage({
            message: 'StartRecognition',
            audio_format: {
              type: 'raw',
              encoding: 'pcm_s16le',
              sample_rate: 16000,
            },
            transcription_config: {
              language: 'en',
              operating_point: 'standard',
              max_delay: 5.0,
              enable_partials: true,
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
      // Send pure binary audio data (Speechmatics expects raw PCM chunks)
      this.ws.send(audioBuffer);
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
    this.log.debug('Speechmatics message', { message: message.message || message.type });
    
    switch (message.message) {
      case 'RecognitionStarted':
        this.log.info('Recognition started', { id: message.id });
        break;

      case 'AudioAdded':
        // Audio successfully added
        break;

      case 'AddPartialTranscript':
        this.handleTranscript(message, false);
        break;

      case 'AddTranscript':
        this.handleTranscript(message, true);
        break;

      case 'EndOfTranscript':
        this.log.info('End of transcript reached');
        break;

      case 'Error':
        this.log.error('Speechmatics error', {
          type: message.type,
          reason: message.reason,
        });
        break;

      case 'Warning':
        this.log.warn('Speechmatics warning', {
          type: message.type,
          reason: message.reason,
        });
        break;

      default:
        this.log.debug('Unknown message', { message: message.message });
    }
  }

  /**
   * Processes transcript messages from Speechmatics
   * @param message - Transcript message
   * @param isFinal - Whether this is a final or partial transcript
   */
  private handleTranscript(message: any, isFinal: boolean): void {
    try {
      const results = message.results || [];
      
      if (results.length === 0) return;

      // Combine all word contents into full transcript
      const words: string[] = [];
      for (const result of results) {
        if (result.alternatives && result.alternatives.length > 0) {
          const word = result.alternatives[0].content;  // Use 'content' not 'transcript'
          if (word) words.push(word);
        }
      }

      const transcript = words.join(' ').trim();

      if (transcript.length > 0) {
        this.log.debug('Transcript received', {
          text: transcript.substring(0, 50),
          isFinal,
        });

        // Call the callback with transcript
        this.onTranscript(transcript, isFinal);
      }
    } catch (error) {
      this.log.error('Failed to process transcript', {
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
        // Send EndOfStream message
        this.sendMessage({ message: 'EndOfStream', last_seq_no: 0 });
        
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
