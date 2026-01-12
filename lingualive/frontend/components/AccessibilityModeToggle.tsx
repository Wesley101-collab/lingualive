import styles from './AccessibilityModeToggle.module.css';

interface AccessibilityModeToggleProps {
  isAccessibilityMode: boolean;
  onToggle: () => void;
}

export function AccessibilityModeToggle({ isAccessibilityMode, onToggle }: AccessibilityModeToggleProps) {
  return (
    <div className={`accessibility-toggle-container ${styles.container}`}>
      <button
        className={`${styles.toggle} ${isAccessibilityMode ? styles.active : ''}`}
        onClick={onToggle}
        aria-pressed={isAccessibilityMode}
        aria-label={isAccessibilityMode ? 'Exit accessibility mode' : 'Enter accessibility mode'}
        title={isAccessibilityMode ? 'Exit full-screen caption mode' : 'Enter full-screen caption mode - hides UI, maximizes text'}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {isAccessibilityMode ? (
            // Exit fullscreen icon
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
          ) : (
            // Fullscreen icon
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          )}
        </svg>
        <span className={styles.label}>
          {isAccessibilityMode ? 'Exit' : 'Accessibility Mode'}
        </span>
      </button>
    </div>
  );
}
