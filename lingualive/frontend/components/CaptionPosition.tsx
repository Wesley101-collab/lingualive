import { useState } from 'react';
import styles from './CaptionPosition.module.css';

type Position = 'top' | 'bottom' | 'floating';

interface CaptionPositionProps {
  position: Position;
  onChange: (position: Position) => void;
}

export function CaptionPositionSelector({ position, onChange }: CaptionPositionProps) {
  return (
    <div className={styles.selector}>
      <button
        className={`${styles.btn} ${position === 'top' ? styles.active : ''}`}
        onClick={() => onChange('top')}
        title="Top"
      >
        ⬆️
      </button>
      <button
        className={`${styles.btn} ${position === 'bottom' ? styles.active : ''}`}
        onClick={() => onChange('bottom')}
        title="Bottom"
      >
        ⬇️
      </button>
      <button
        className={`${styles.btn} ${position === 'floating' ? styles.active : ''}`}
        onClick={() => onChange('floating')}
        title="Floating"
      >
        🔲
      </button>
    </div>
  );
}

interface FloatingCaptionProps {
  text: string;
  position: Position;
  fontSize?: number;
}

export function FloatingCaption({ text, position, fontSize = 24 }: FloatingCaptionProps) {
  if (position !== 'floating') return null;

  return (
    <div className={styles.floatingCaption} style={{ fontSize: `${fontSize}px` }}>
      {text}
    </div>
  );
}
