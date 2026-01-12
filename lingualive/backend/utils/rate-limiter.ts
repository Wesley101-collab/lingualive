const connectionCounts = new Map<string, number>();
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS_PER_IP || '5', 10);

export function checkRateLimit(ip: string): boolean {
  const count = connectionCounts.get(ip) || 0;
  return count < MAX_CONNECTIONS;
}

export function incrementConnection(ip: string): void {
  const count = connectionCounts.get(ip) || 0;
  connectionCounts.set(ip, count + 1);
}

export function decrementConnection(ip: string): void {
  const count = connectionCounts.get(ip) || 0;
  if (count > 1) {
    connectionCounts.set(ip, count - 1);
  } else {
    connectionCounts.delete(ip);
  }
}
