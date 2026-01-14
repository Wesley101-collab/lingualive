/**
 * WebSocket Hook for LinguaLive
 * Manages WebSocket connection lifecycle, auto-reconnection, and message handling
 * @module hooks/useWebSocket
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL, WS_EVENTS } from '../utils/constants';

/** Possible connection states */
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Configuration options for the WebSocket hook */
interface UseWebSocketOptions {
  /** Role determines message routing on the server */
  role: 'speaker' | 'viewer';
  /** Callback invoked when a message is received */
  onMessage?: (data: unknown) => void;
}

/** Return type of the useWebSocket hook */
interface UseWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Number of connected viewers (updated via server messages) */
  viewerCount: number;
  /** Send a message to the server */
  send: (data: object) => void;
  /** Manually initiate connection */
  connect: () => void;
  /** Manually close connection */
  disconnect: () => void;
}

/** Reconnection delay in milliseconds */
const RECONNECT_DELAY = 3000;

/**
 * React hook for managing WebSocket connections
 * 
 * Features:
 * - Automatic connection on mount
 * - Auto-reconnection on unexpected disconnects
 * - Viewer count tracking
 * - Clean disconnect on unmount
 * 
 * @param options - Configuration options
 * @returns Connection state and control functions
 * 
 * @example
 * ```tsx
 * const { status, send } = useWebSocket({
 *   role: 'speaker',
 *   onMessage: (data) => console.log('Received:', data)
 * });
 * 
 * // Send audio data
 * send({ type: 'AUDIO_DATA', data: base64Audio });
 * ```
 */
export function useWebSocket({ role, onMessage }: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [viewerCount, setViewerCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const onMessageRef = useRef(onMessage);
  const mountedRef = useRef(true);
  
  // Keep onMessage ref updated without triggering reconnects
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  /**
   * Establishes WebSocket connection
   * Handles connection state, message parsing, and auto-reconnection
   */
  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');
    
    const wsUrl = `${WS_URL}?role=${role}`;
    console.log(`[WebSocket] Connecting to: ${wsUrl}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) {
          console.log(`[WebSocket] Connected as ${role}`);
          setStatus('connected');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Update viewer count from server status messages
          if (data.type === WS_EVENTS.CONNECTION_STATUS) {
            if (mountedRef.current) {
              setViewerCount(data.viewerCount || 0);
            }
          }
          
          onMessageRef.current?.(data);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        if (mountedRef.current) {
          setStatus('error');
        }
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Closed: code=${event.code}, reason=${event.reason}`);
        wsRef.current = null;
        
        if (mountedRef.current) {
          setStatus('disconnected');
          
          // Auto-reconnect on unexpected disconnects
          // 1000 = normal closure, 1001 = going away (page navigation)
          if (event.code !== 1000 && event.code !== 1001) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                console.log('[WebSocket] Attempting reconnection...');
                connect();
              }
            }, RECONNECT_DELAY);
          }
        }
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      setStatus('error');
    }
  }, [role]);

  /**
   * Cleanly closes the WebSocket connection
   * Cancels any pending reconnection attempts
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  /**
   * Sends data to the server via WebSocket
   * Silently fails if connection is not open
   * @param data - Object to send (will be JSON stringified)
   */
  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send - connection not open');
    }
  }, []);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    connect();
    
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { status, viewerCount, send, connect, disconnect };
}
