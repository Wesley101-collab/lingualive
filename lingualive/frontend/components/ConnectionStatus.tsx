import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  viewerCount?: number;
}

export function ConnectionStatus({ status, viewerCount }: ConnectionStatusProps) {
  const statusLabels = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Connection Error',
  };

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <span className={`${styles.indicator} ${styles[status]}`} aria-hidden="true" />
      <span className={styles.label}>{statusLabels[status]}</span>
      {viewerCount !== undefined && status === 'connected' && (
        <span className={styles.viewers}>
          {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
