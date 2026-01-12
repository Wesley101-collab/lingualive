import { useState, useEffect, useRef } from 'react';
import styles from './SessionRecorder.module.css';

interface SessionRecorderProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function SessionRecorder({ isRecording, onToggle }: SessionRecorderProps) {
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setDuration(0);
      intervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
        onClick={onToggle}
        aria-pressed={isRecording}
      >
        <span className={styles.recordDot} />
        <span>{isRecording ? 'Stop Recording' : 'Record Session'}</span>
      </button>
      {isRecording && (
        <span className={styles.duration}>{formatDuration(duration)}</span>
      )}
    </div>
  );
}
