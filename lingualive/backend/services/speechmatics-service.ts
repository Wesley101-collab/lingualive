import WebSocket from 'ws';

const SPEECHMATICS_RT_URL = 'wss://eu.rt.speechmatics.com/v2';

interface TranscriptCallback {
  (text: string, isFinal: boolean): void;
}

export class SpeechmaticsService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private onTranscript: TranscriptCallback;
  private isConnected = false;

  constructor(apiKey: string, onTranscript: TranscriptCallback) {
    this.apiKey = apiKey;
    this.onTranscript = onTranscript;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = SPEECHMATICS_RT_URL;
      
      this.ws = new WebSocket(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      this.ws.on('open', () => {
        this.sendConfig();
        this.isConnected = true;
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('error', (error) => {
        console.error('Speechmatics error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
      });
    });
  }

  private sendConfig(): void {
    const config = {
      message: 'StartRecognition',
      transcription_config: {
        language: 'en',
        enable_partials: true,
        max_delay: 2,
      },
      audio_format: {
        type: 'raw',
        encoding: 'pcm_s16le',
        sample_rate: 16000,
      },
    };
    this.ws?.send(JSON.stringify(config));
  }

  private handleMessage(data: string): void {
    try {
      const msg = JSON.parse(data);
      
      if (msg.message === 'AddPartialTranscript' && msg.metadata?.transcript) {
        this.onTranscript(msg.metadata.transcript, false);
      } else if (msg.message === 'AddTranscript' && msg.metadata?.transcript) {
        this.onTranscript(msg.metadata.transcript, true);
      }
    } catch (e) {
      console.error('Failed to parse Speechmatics message:', e);
    }
  }

  sendAudio(audioData: Buffer): void {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }

  disconnect(): void {
    if (this.ws) {
      if (this.isConnected) {
        this.ws.send(JSON.stringify({ message: 'EndOfStream' }));
      }
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
