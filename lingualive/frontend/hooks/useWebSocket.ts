import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL, WS_EVENTS } from '../utils/constants';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  role: 'speaker' | 'viewer';
  onMessage?: (data: unknown) => void;
}

// Global connection tracking to handle React Strict Mode double-mounting
const activeConnections = new Map<string, WebSocket>();

export function useWebSocket({ role, onMessage }: UseWebSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [viewerCount, setViewerCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const onMessageRef = useRef(onMessage);
  const mountedRef = useRef(true);
  const connectionKeyRef = useRef(`${role}-${Math.random().toString(36).slice(2)}`);
  
  // Keep the callback ref updated without triggering reconnects
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const getWs = useCallback(() => {
    return activeConnections.get(connectionKeyRef.current) || null;
  }, []);

  const connect = useCallback(() => {
    const existingWs = getWs();
    if (existingWs?.readyState === WebSocket.OPEN || 
        existingWs?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setStatus('connecting');
    const ws = new WebSocket(`${WS_URL}?role=${role}`);
    activeConnections.set(connectionKeyRef.current, ws);

    ws.onopen = () => {
      if (mountedRef.current) {
        setStatus('connected');
        console.log(`WebSocket connected as ${role}`);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === WS_EVENTS.CONNECTION_STATUS) {
          if (mountedRef.current) {
            setViewerCount(data.viewerCount || 0);
          }
        }
        
        onMessageRef.current?.(data);
      } catch (e) {
        console.error('Failed to parse message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (mountedRef.current) {
        setStatus('error');
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code} ${event.reason}`);
      activeConnections.delete(connectionKeyRef.current);
      
      if (mountedRef.current) {
        setStatus('disconnected');
        
        // Auto-reconnect after 3 seconds for unexpected closures
        if (event.code !== 1000 && event.code !== 1001) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, 3000);
        }
      }
    };
  }, [role, getWs]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    const ws = getWs();
    if (ws) {
      ws.close(1000, 'User disconnected');
      activeConnections.delete(connectionKeyRef.current);
    }
    setStatus('disconnected');
  }, [getWs]);

  const send = useCallback((data: object) => {
    const ws = getWs();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, [getWs]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      const ws = getWs();
      if (ws) {
        ws.close(1000, 'Component unmounted');
        activeConnections.delete(connectionKeyRef.current);
      }
    };
  }, [connect, getWs]);

  return { status, viewerCount, send, connect, disconnect };
}
