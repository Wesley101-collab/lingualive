import { useRef, useEffect } from 'react';
import { highlightKeywords } from '../utils/highlightKeywords';
import styles from './LiveCaptionPanel.module.css';

interface LiveCaptionPanelProps {
  captions: string[];
  isHighContrast?: boolean;
  enableKeywordHighlighting?: boolean;
  fontSize?: number;
  autoScroll?: boolean;
}

export function LiveCaptionPanel({ 
  captions, 
  isHighContrast, 
  enableKeywordHighlighting = true,
  fontSize = 18,
  autoScroll = true
}: LiveCaptionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [captions, autoScroll]);

  return (
    <div 
      ref={panelRef}
      className={`${styles.panel} ${isHighContrast ? styles.highContrast : ''}`}
      role="region"
      aria-label="Live captions"
      aria-live="polite"
      aria-atomic="false"
      style={{ '--caption-font-size': `${fontSize}px` } as React.CSSProperties}
    >
      {captions.length === 0 ? (
        <p className={styles.placeholder}>Captions will appear here...</p>
      ) : (
        captions.map((caption, index) => (
          enableKeywordHighlighting ? (
            <p 
              key={index} 
              className={styles.caption}
              dangerouslySetInnerHTML={{ __html: highlightKeywords(caption) }}
            />
          ) : (
            <p key={index} className={styles.caption}>
              {caption}
            </p>
          )
        ))
      )}
    </div>
  );
}
