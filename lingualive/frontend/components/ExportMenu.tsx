import { useState, useRef, useEffect } from 'react';
import styles from './ExportMenu.module.css';

interface ExportMenuProps {
  captions: string[];
  language: string;
}

export function ExportMenu({ captions, language }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportAsTxt = () => {
    const content = captions.join('\n\n');
    downloadFile(content, `transcript-${language}.txt`, 'text/plain');
    setIsOpen(false);
  };

  const exportAsSrt = () => {
    const srtContent = captions.map((caption, i) => {
      const startTime = formatSrtTime(i * 3);
      const endTime = formatSrtTime((i + 1) * 3);
      return `${i + 1}\n${startTime} --> ${endTime}\n${caption}\n`;
    }).join('\n');
    downloadFile(srtContent, `subtitles-${language}.srt`, 'text/plain');
    setIsOpen(false);
  };

  const exportAsJson = () => {
    const data = {
      language,
      exportedAt: new Date().toISOString(),
      captions: captions.map((text, i) => ({ id: i + 1, text }))
    };
    downloadFile(JSON.stringify(data, null, 2), `transcript-${language}.json`, 'application/json');
    setIsOpen(false);
  };

  const formatSrtTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s},000`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.exportButton}
        onClick={() => setIsOpen(!isOpen)}
        disabled={captions.length === 0}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Export</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <button className={styles.dropdownItem} onClick={exportAsTxt} role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Text (.txt)
          </button>
          <button className={styles.dropdownItem} onClick={exportAsSrt} role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            Subtitles (.srt)
          </button>
          <button className={styles.dropdownItem} onClick={exportAsJson} role="menuitem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            JSON (.json)
          </button>
        </div>
      )}
    </div>
  );
}
