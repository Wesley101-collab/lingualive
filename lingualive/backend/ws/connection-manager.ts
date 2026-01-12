import WebSocket from 'ws';

// WebSocket Event Names
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
type ClientRole = 'speaker' | 'viewer';

interface Client {
  id: string;
  role: ClientRole;
  language: LanguageCode;
  connectedAt: number;
}

interface CaptionUpdateMessage {
  type: typeof WS_EVENTS.CAPTION_UPDATE;
  text: string;
  language: LanguageCode;
  isFinal: boolean;
  timestamp: number;
}

interface ConnectionStatusMessage {
  type: typeof WS_EVENTS.CONNECTION_STATUS;
  status: 'connected' | 'disconnected' | 'speaking' | 'idle';
  viewerCount?: number;
  timestamp: number;
}

export class ConnectionManager {
  private clients = new Map<WebSocket, Client>();
  private speaker: WebSocket | null = null;

  addClient(ws: WebSocket, role: ClientRole, language: LanguageCode = 'en'): Client {
    const client: Client = {
      id: crypto.randomUUID(),
      role,
      language,
      connectedAt: Date.now(),
    };
    
    this.clients.set(ws, client);
    
    if (role === 'speaker') {
      this.speaker = ws;
    }
    
    this.broadcastViewerCount();
    return client;
  }

  removeClient(ws: WebSocket): void {
    const client = this.clients.get(ws);
    if (client?.role === 'speaker') {
      this.speaker = null;
    }
    this.clients.delete(ws);
    this.broadcastViewerCount();
  }

  getClient(ws: WebSocket): Client | undefined {
    return this.clients.get(ws);
  }

  updateClientLanguage(ws: WebSocket, language: LanguageCode): void {
    const client = this.clients.get(ws);
    if (client) {
      client.language = language;
    }
  }

  getSpeaker(): WebSocket | null {
    return this.speaker;
  }

  hasSpeaker(): boolean {
    return this.speaker !== null;
  }

  getViewers(): Map<WebSocket, Client> {
    const viewers = new Map<WebSocket, Client>();
    for (const [ws, client] of this.clients) {
      if (client.role === 'viewer') {
        viewers.set(ws, client);
      }
    }
    return viewers;
  }

  getViewersByLanguage(): Map<LanguageCode, WebSocket[]> {
    const byLang = new Map<LanguageCode, WebSocket[]>();
    
    for (const [ws, client] of this.clients) {
      if (client.role === 'viewer') {
        const list = byLang.get(client.language) || [];
        list.push(ws);
        byLang.set(client.language, list);
      }
    }
    
    return byLang;
  }

  broadcastCaption(text: string, language: LanguageCode, isFinal: boolean): void {
    const message: CaptionUpdateMessage = {
      type: WS_EVENTS.CAPTION_UPDATE,
      text,
      language,
      isFinal,
      timestamp: Date.now(),
    };
    
    const data = JSON.stringify(message);
    
    for (const [ws, client] of this.clients) {
      if (client.language === language && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  broadcastToAll(message: object): void {
    const data = JSON.stringify(message);
    for (const [ws] of this.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  private broadcastViewerCount(): void {
    const viewerCount = this.getViewers().size;
    const status: ConnectionStatusMessage = {
      type: WS_EVENTS.CONNECTION_STATUS,
      status: this.hasSpeaker() ? 'speaking' : 'idle',
      viewerCount,
      timestamp: Date.now(),
    };
    this.broadcastToAll(status);
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      viewers: this.getViewers().size,
      hasSpeaker: this.hasSpeaker(),
    };
  }
}
