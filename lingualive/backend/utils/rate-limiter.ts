/**
 * Rate Limiter Utility
 * Provides request rate limiting and connection tracking
 * @module utils/rate-limiter
 */

interface RateLimiterConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
}

interface ClientRecord {
  count: number;
  windowStart: number;
}

/**
 * Rate limiter class for controlling request frequency
 */
export class RateLimiter {
  private config: RateLimiterConfig;
  private clients: Map<string, ClientRecord> = new Map();

  /**
   * Creates a new RateLimiter instance
   * @param config - Rate limiter configuration
   */
  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Checks if a request is allowed for the given client
   * @param clientId - Unique client identifier (e.g., IP address)
   * @returns True if request is allowed, false if rate limited
   */
  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const record = this.clients.get(clientId);

    if (!record || now - record.windowStart >= this.config.windowMs) {
      // New window
      this.clients.set(clientId, { count: 1, windowStart: now });
      return true;
    }

    if (record.count < this.config.maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  /**
   * Gets remaining requests for a client in current window
   * @param clientId - Unique client identifier
   * @returns Number of remaining requests
   */
  getRemainingRequests(clientId: string): number {
    const now = Date.now();
    const record = this.clients.get(clientId);

    if (!record || now - record.windowStart >= this.config.windowMs) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Resets rate limit for a specific client
   * @param clientId - Unique client identifier
   */
  reset(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Cleans up expired client records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [clientId, record] of this.clients.entries()) {
      if (now - record.windowStart >= this.config.windowMs) {
        this.clients.delete(clientId);
      }
    }
  }
}

// Connection tracking for WebSocket connections
const connectionCounts = new Map<string, number>();
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS_PER_IP || '5', 10);

/**
 * Checks if a new connection is allowed for the given IP
 * @param ip - Client IP address
 * @returns True if connection is allowed
 */
export function checkRateLimit(ip: string): boolean {
  const count = connectionCounts.get(ip) || 0;
  return count < MAX_CONNECTIONS;
}

/**
 * Increments connection count for an IP
 * @param ip - Client IP address
 */
export function incrementConnection(ip: string): void {
  const count = connectionCounts.get(ip) || 0;
  connectionCounts.set(ip, count + 1);
}

/**
 * Decrements connection count for an IP
 * @param ip - Client IP address
 */
export function decrementConnection(ip: string): void {
  const count = connectionCounts.get(ip) || 0;
  if (count > 1) {
    connectionCounts.set(ip, count - 1);
  } else {
    connectionCounts.delete(ip);
  }
}

/**
 * Gets current connection count for an IP
 * @param ip - Client IP address
 * @returns Current connection count
 */
export function getConnectionCount(ip: string): number {
  return connectionCounts.get(ip) || 0;
}
