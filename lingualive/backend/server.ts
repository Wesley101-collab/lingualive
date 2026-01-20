import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from parent directory
config({ path: resolve(process.cwd(), '../.env') });

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { ConnectionManager } from './ws/connection-manager.js';
import { MessageHandler } from './ws/message-handler.js';
import { TranslationService } from './services/translation-service.js';
import { validateMessage } from './utils/message-validator.js';
import { checkRateLimit, incrementConnection, decrementConnection } from './utils/rate-limiter.js';

const WS_EVENTS = {
  AUDIO_DATA: 'AUDIO_DATA',
  CAPTION_UPDATE: 'CAPTION_UPDATE',
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  CONNECTION_STATUS: 'CONNECTION_STATUS',
  SPEAKER_START: 'SPEAKER_START',
  SPEAKER_STOP: 'SPEAKER_STOP',
  ERROR: 'ERROR',
} as const;

type ClientRole = 'speaker' | 'viewer';

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

const connectionManager = new ConnectionManager();
const translationService = new TranslationService(process.env.TRANSLATION_API_KEY || '');
const messageHandler = new MessageHandler(connectionManager, translationService);

const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });

function getClientIP(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function parseRole(url: string | undefined): ClientRole {
  if (!url) return 'viewer';
  const params = new URLSearchParams(url.split('?')[1] || '');
  return params.get('role') === 'speaker' ? 'speaker' : 'viewer';
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const ip = getClientIP(req);
  
  if (!checkRateLimit(ip)) {
    ws.close(1008, 'Too many connections');
    return;
  }
  
  incrementConnection(ip);
  
  const role = parseRole(req.url);
  
  if (role === 'speaker' && connectionManager.hasSpeaker()) {
    const oldSpeaker = connectionManager.getSpeaker();
    if (oldSpeaker) {
      oldSpeaker.close(1000, 'New speaker connected');
    }
  }
  
  const client = connectionManager.addClient(ws, role);
  console.log(`Client connected: ${client.id} (${role})`);
  
  ws.send(JSON.stringify({
    type: WS_EVENTS.CONNECTION_STATUS,
    status: 'connected',
    viewerCount: connectionManager.getStats().viewers,
    timestamp: Date.now(),
  }));

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      console.log(`[Server] Message received from ${client.id}:`, parsed.type);
      
      // Extra logging for SPEAKER_START
      if (parsed.type === 'SPEAKER_START') {
        console.log('*** SPEAKER_START MESSAGE RECEIVED IN SERVER ***');
      }
      
      const validated = validateMessage(parsed);
      if (validated) {
        console.log(`[Server] Message validated, passing to handler:`, validated.type);
        await messageHandler.handleMessage(ws, validated);
      } else {
        console.log(`[Server] Message validation failed for ${client.id}:`, parsed);
      }
    } catch (error) {
      console.error(`[Server] Error parsing message from ${client.id}:`, error);
      ws.send(JSON.stringify({
        type: WS_EVENTS.ERROR,
        message: 'Invalid message format',
        timestamp: Date.now(),
      }));
    }
  });

  ws.on('close', () => {
    connectionManager.removeClient(ws);
    decrementConnection(ip);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${client.id}:`, error);
  });
});

console.log(`WebSocket server running on 0.0.0.0:${PORT}`);
console.log('Accessible from other devices on the network');
console.log('Waiting for connections...');

process.on('SIGINT', () => {
  messageHandler.cleanup();
  wss.close(() => process.exit(0));
});
