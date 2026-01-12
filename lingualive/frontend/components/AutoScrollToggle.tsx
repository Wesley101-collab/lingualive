import styles from './AutoScrollToggle.module.css';

interface AutoScrollToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function AutoScrollToggle({ isEnabled, onToggle }: AutoScrollToggleProps) {
  return (
    <button
      className={`${styles.button} ${isEnabled ? styles.active : ''}`}
      onClick={onToggle}
      aria-pressed={isEnabled}
      aria-label={isEnabled ? 'Disable auto-scroll' : 'Enable auto-scroll'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {isEnabled ? (
          <>
            <polyline points="6 9 12 15 18 9"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </>
        ) : (
          <>
            <line x1="5" y1="9" x2="19" y2="9"/>
            <line x1="5" y1="15" x2="19" y2="15"/>
          </>
        )}
      </svg>
      <span>{isEnabled ? 'Auto-scroll ON' : 'Auto-scroll OFF'}</span>
    </button>
  );
}
