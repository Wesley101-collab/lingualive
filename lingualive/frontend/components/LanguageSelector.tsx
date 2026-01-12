import { SUPPORTED_LANGUAGES, LanguageCode } from '../utils/constants';
import styles from './LanguageSelector.module.css';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className={styles.container}>
      <label htmlFor="language-select" className={styles.label}>
        Caption Language
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className={styles.select}
        aria-describedby="language-help"
        title="Select your preferred language for captions"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <span id="language-help" className="sr-only">
        Select your preferred language for live captions. Captions will be translated in real-time.
      </span>
    </div>
  );
}
