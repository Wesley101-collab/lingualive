import styles from './FontSizeSlider.module.css';

interface FontSizeSliderProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
}

export function FontSizeSlider({ value, onChange, min = 14, max = 48 }: FontSizeSliderProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        <span className={styles.icon}>Aa</span>
        <span className={styles.text}>Font Size</span>
      </label>
      <div className={styles.sliderWrapper}>
        <span className={styles.minLabel}>A</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={styles.slider}
          aria-label="Font size"
        />
        <span className={styles.maxLabel}>A</span>
      </div>
      <span className={styles.value}>{value}px</span>
    </div>
  );
}
