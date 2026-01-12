import styles from './MicrophoneButton.module.css';

interface MicrophoneButtonProps {
  isActive: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export function MicrophoneButton({ isActive, isDisabled, onClick }: MicrophoneButtonProps) {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isActive}
      aria-label={isActive ? 'Stop speaking' : 'Start speaking'}
      title={isDisabled ? 'Connect to server first' : isActive ? 'Click to stop speaking' : 'Click to start speaking'}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {isActive ? (
          <path d="M6 6h12v12H6z" />
        ) : (
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
        )}
      </svg>
      <span className={styles.label}>
        {isActive ? 'Stop Speaking' : 'Start Speaking'}
      </span>
    </button>
  );
}
