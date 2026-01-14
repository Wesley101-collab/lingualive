import { useMemo } from 'react';
import styles from './SessionStats.module.css';

interface SessionStatsProps {
  captions: string[];
  startTime?: Date;
  language?: string;
}

export function SessionStats({ captions, startTime, language = 'English' }: SessionStatsProps) {
  const stats = useMemo(() => {
    const totalWords = captions.reduce((acc, caption) => {
      return acc + caption.split(/\s+/).filter(Boolean).length;
    }, 0);

    const totalChars = captions.reduce((acc, caption) => acc + caption.length, 0);
    
    const duration = startTime 
      ? Math.floor((Date.now() - startTime.getTime()) / 1000)
      : 0;
    
    const minutes = duration / 60;
    const wpm = minutes > 0 ? Math.round(totalWords / minutes) : 0;

    // Word frequency for word cloud
    const wordFreq: Record<string, number> = {};
    captions.forEach((caption) => {
      caption.toLowerCase().split(/\s+/).forEach((word) => {
        const clean = word.replace(/[^a-zA-Z]/g, '');
        if (clean.length > 3) {
          wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        }
      });
    });

    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalWords,
      totalChars,
      captionCount: captions.length,
      duration,
      wpm,
      topWords,
    };
  }, [captions, startTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.stats}>
      <div className={styles.statGrid}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.totalWords}</span>
          <span className={styles.statLabel}>Words</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.captionCount}</span>
          <span className={styles.statLabel}>Captions</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.wpm}</span>
          <span className={styles.statLabel}>WPM</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{formatDuration(stats.duration)}</span>
          <span className={styles.statLabel}>Duration</span>
        </div>
      </div>

      {stats.topWords.length > 0 && (
        <div className={styles.wordCloud}>
          <h4>Top Words</h4>
          <div className={styles.words}>
            {stats.topWords.map(([word, count], i) => (
              <span
                key={word}
                className={styles.word}
                style={{
                  fontSize: `${Math.max(0.75, 1.25 - i * 0.05)}rem`,
                  opacity: Math.max(0.5, 1 - i * 0.05),
                }}
              >
                {word}
                <span className={styles.wordCount}>{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
