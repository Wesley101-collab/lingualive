import styles from './AccessibilityToggle.module.css';

interface AccessibilityToggleProps {
  isHighContrast: boolean;
  onToggle: () => void;
}

export function AccessibilityToggle({ isHighContrast, onToggle }: AccessibilityToggleProps) {
  return (
    <button
      className={`${styles.toggle} ${isHighContrast ? styles.active : ''}`}
      onClick={onToggle}
      aria-pressed={isHighContrast}
      aria-label={isHighContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      title={isHighContrast ? 'Switch to normal contrast' : 'Switch to high contrast for better visibility'}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
      <span>{isHighContrast ? 'High Contrast On' : 'High Contrast'}</span>
    </button>
  );
}
