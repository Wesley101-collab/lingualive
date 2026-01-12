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
        <h3 className={styles.title}>🤖 AI Analysis</h3>
        {!result && (
          <button 
            onClick={generateSummary} 
            disabled={isGenerating || !transcript}
            className={styles.generateBtn}
          >
            {isGenerating ? '⏳ Analyzing...' : '✨ Generate Summary'}
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
              📝 Summary
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'keypoints' ? styles.active : ''}`}
              onClick={() => setActiveTab('keypoints')}
            >
              💡 Key Points ({result.keyPoints.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'actions' ? styles.active : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              ✅ Actions ({result.actionItems.length})
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
                  📋 Copy
                </button>
              </div>
            )}

            {activeTab === 'keypoints' && (
              <ul className={styles.list}>
                {result.keyPoints.map((point, i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.bullet}>💡</span>
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
              📥 Export as Markdown
            </button>
            <button onClick={() => setResult(null)} className={styles.resetBtn}>
              🔄 Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
