import { useState, useEffect } from 'react';
import styles from './ThemeSelector.module.css';

type Theme = 'system' | 'light' | 'dark' | 'high-contrast' | 'dyslexia';

interface ThemeSelectorProps {
  onChange?: (theme: Theme) => void;
}

const THEMES: { id: Theme; name: string; icon: string }[] = [
  { id: 'system', name: 'System', icon: '💻' },
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'high-contrast', name: 'High Contrast', icon: '🔲' },
  { id: 'dyslexia', name: 'Dyslexia Friendly', icon: '📖' },
];

export function ThemeSelector({ onChange }: ThemeSelectorProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lingualive_theme') as Theme;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast', 'theme-dyslexia');
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${newTheme}`);
    }
  };

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('lingualive_theme', newTheme);
    setIsOpen(false);
    onChange?.(newTheme);
  };

  const currentTheme = THEMES.find(t => t.id === theme);

  return (
    <div className={styles.selector}>
      <button 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentTheme?.icon}</span>
        <span>{currentTheme?.name}</span>
        <span className={styles.arrow}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`${styles.option} ${theme === t.id ? styles.active : ''}`}
              onClick={() => handleSelect(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
