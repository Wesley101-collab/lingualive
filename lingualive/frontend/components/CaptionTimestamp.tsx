import styles from './CaptionTimestamp.module.css';

interface TimestampedCaption {
  text: string;
  timestamp: Date;
  speaker?: string;
}

interface CaptionWithTimestampProps {
  caption: TimestampedCaption;
  showTimestamp?: boolean;
  showSpeaker?: boolean;
  fontSize?: number;
}

export function CaptionWithTimestamp({
  caption,
  showTimestamp = true,
  showSpeaker = true,
  fontSize = 16,
}: CaptionWithTimestampProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={styles.caption} style={{ fontSize: `${fontSize}px` }}>
      <div className={styles.meta}>
        {showTimestamp && (
          <span className={styles.timestamp}>{formatTime(caption.timestamp)}</span>
        )}
        {showSpeaker && caption.speaker && (
          <span className={styles.speaker}>{caption.speaker}</span>
        )}
      </div>
      <p className={styles.text}>{caption.text}</p>
    </div>
  );
}

// Helper to create timestamped caption
export function createTimestampedCaption(text: string, speaker?: string): TimestampedCaption {
  return {
    text,
    timestamp: new Date(),
    speaker,
  };
}
