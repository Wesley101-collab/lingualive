import { useState } from 'react';
import styles from './AISummary.module.css';

interface AISummaryProps {
  transcript: string;
  onSummaryGenerated?: (summary: string) => void;
}

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// SVG Icons
const Icons = {
  ai: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>,
  generate: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM12 3L2 21h20L12 3z"/></svg>,
  summary: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>,
  keypoint: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>,
  action: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>,
  loading: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>,
};

export function AISummary({ transcript, onSummaryGenerated }: AISummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'keypoints' | 'actions'>('summary');

  const generateSummary = async () => {
    if (!transcript || transcript.length < 50) {
      setError('Need more transcript content to generate summary');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const data = await response.json();
      setResult(data);
      onSummaryGenerated?.(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summary generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportSummary = () => {
    if (!result) return;
    
    const content = `# Meeting Summary\n\n${result.summary}\n\n## Key Points\n${result.keyPoints.map(p => `- ${p}`).join('\n')}\n\n## Action Items\n${result.actionItems.map(a => `- [ ] ${a}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>{Icons.ai}</span>
          AI Analysis
        </h3>
        {!result && (
          <button 
            onClick={generateSummary} 
            disabled={isGenerating || !transcript}
            className={styles.generateBtn}
          >
            <span className={styles.btnIcon}>
              {isGenerating ? Icons.loading : Icons.generate}
            </span>
            {isGenerating ? 'Analyzing...' : 'Generate Summary'}
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <span className={styles.tabIcon}>{Icons.summary}</span>
              Summary
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'keypoints' ? styles.active : ''}`}
              onClick={() => setActiveTab('keypoints')}
            >
              <span className={styles.tabIcon}>{Icons.keypoint}</span>
              Key Points ({result.keyPoints.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'actions' ? styles.active : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <span className={styles.tabIcon}>{Icons.action}</span>
              Actions ({result.actionItems.length})
            </button>
          </div>

          <div className={styles.content}>
            {activeTab === 'summary' && (
              <div className={styles.summaryContent}>
                <p>{result.summary}</p>
                <button 
                  onClick={() => copyToClipboard(result.summary)}
                  className={styles.copyBtn}
                >
                  <span className={styles.btnIcon}>{Icons.copy}</span>
                  Copy
                </button>
              </div>
            )}

            {activeTab === 'keypoints' && (
              <ul className={styles.list}>
                {result.keyPoints.map((point, i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.bullet}>{Icons.keypoint}</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'actions' && (
              <ul className={styles.list}>
                {result.actionItems.map((action, i) => (
                  <li key={i} className={styles.actionItem}>
                    <input type="checkbox" id={`action-${i}`} />
                    <label htmlFor={`action-${i}`}>{action}</label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.actions}>
            <button onClick={exportSummary} className={styles.exportBtn}>
              <span className={styles.btnIcon}>{Icons.download}</span>
              Export as Markdown
            </button>
            <button onClick={() => setResult(null)} className={styles.resetBtn}>
              <span className={styles.btnIcon}>{Icons.refresh}</span>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
