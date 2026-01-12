import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../utils/constants';
import styles from '../styles/Upload.module.css';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

interface SavedState {
  transcript: string;
  analysis: AnalysisResult | null;
  language: LanguageCode;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'transcript' | 'summary' | 'actions'>('input');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem('lingualive_analysis');
    if (saved) {
      try {
        const state: SavedState = JSON.parse(saved);
        setTranscript(state.transcript);
        setTranslatedText(state.transcript);
        setAnalysis(state.analysis);
        setLanguage(state.language);
        if (state.transcript) {
          setActiveTab('summary');
        }
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (transcript || analysis) {
      const state: SavedState = { transcript, analysis, language };
      localStorage.setItem('lingualive_analysis', JSON.stringify(state));
    }
  }, [transcript, analysis, language]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (f: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    const isValid = validTypes.some(t => f.type.includes(t.split('/')[1])) || f.name.endsWith('.mp3') || f.name.endsWith('.wav');
    
    if (!isValid) {
      setError('Please upload a video (MP4, WebM) or audio (MP3, WAV) file');
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError('File size must be under 25MB for transcription');
      return;
    }
    setFile(f);
    setError(null);
  };

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Send to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          audio: base64,
          mimeType: file.type || 'audio/mp3',
          fileName: file.name
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Transcription failed');
      }

      const data = await response.json();
      
      if (data.transcript) {
        setTranscript(data.transcript);
        setTranslatedText(data.transcript);
        setManualInput(data.transcript);
        
        // Auto-analyze
        await analyzeText(data.transcript);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeText = async (text: string) => {
    if (!text || text.length < 30) {
      setError('Please enter at least 30 characters to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const data = await response.json();
      setTranscript(text);
      setTranslatedText(text);
      setAnalysis(data);
      setActiveTab('summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    analyzeText(manualInput);
  };

  const handleLanguageChange = async (newLang: LanguageCode) => {
    setLanguage(newLang);
    if (newLang === 'en' || !transcript) {
      setTranslatedText(transcript);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(transcript.slice(0, 500))}&langpair=en|${newLang}`
      );
      const data = await response.json();
      if (data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const exportContent = () => {
    if (!transcript) return;
    let content = `# Transcript\n\n${translatedText}`;
    if (analysis) {
      content += `\n\n# Summary\n\n${analysis.summary}`;
      content += `\n\n# Key Points\n\n${analysis.keyPoints.map(p => `- ${p}`).join('\n')}`;
      content += `\n\n# Action Items\n\n${analysis.actionItems.map(a => `- [ ] ${a}`).join('\n')}`;
    }
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setManualInput('');
    setTranscript('');
    setTranslatedText('');
    setAnalysis(null);
    setFile(null);
    setError(null);
    setActiveTab('input');
    localStorage.removeItem('lingualive_analysis');
  };

  return (
    <>
      <Head>
        <title>Upload & Analyze - LinguaLive</title>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Upload & Analyze</h1>
          <p className={styles.subtitle}>Upload audio/video or paste text for AI-powered analysis</p>
        </header>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'input' ? styles.active : ''}`}
            onClick={() => setActiveTab('input')}
          >
            ✏️ Input
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'transcript' ? styles.active : ''}`}
            onClick={() => setActiveTab('transcript')}
            disabled={!transcript}
          >
            📝 Transcript
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
            onClick={() => setActiveTab('summary')}
            disabled={!analysis}
          >
            ✨ Summary
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'actions' ? styles.active : ''}`}
            onClick={() => setActiveTab('actions')}
            disabled={!analysis}
          >
            ✅ Actions {analysis && analysis.actionItems.length > 0 && `(${analysis.actionItems.length})`}
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.content}>
          {activeTab === 'input' && (
            <div className={styles.inputTab}>
              {/* Mode Toggle */}
              <div className={styles.modeToggle}>
                <button 
                  className={`${styles.modeBtn} ${inputMode === 'text' ? styles.active : ''}`}
                  onClick={() => setInputMode('text')}
                >
                  ✏️ Paste Text
                </button>
                <button 
                  className={`${styles.modeBtn} ${inputMode === 'file' ? styles.active : ''}`}
                  onClick={() => setInputMode('file')}
                >
                  📁 Upload File
                </button>
              </div>

              {inputMode === 'text' ? (
                <>
                  <textarea
                    className={styles.textInput}
                    placeholder="Paste your meeting notes, transcript, or any text here...

Example:
Today we discussed the Q4 roadmap. John will lead the mobile app redesign. Sarah needs to finalize the budget by Friday. We agreed to launch the new feature in January."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    rows={10}
                  />
                  
                  <div className={styles.inputFooter}>
                    <span className={styles.charCount}>
                      {manualInput.length} characters {manualInput.length < 30 && '(min 30)'}
                    </span>
                    <div className={styles.inputActions}>
                      <button 
                        className={styles.analyzeBtn}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || manualInput.length < 30}
                      >
                        {isAnalyzing ? (
                          <><span className={styles.spinner} /> Analyzing...</>
                        ) : (
                          <>🤖 Analyze with AI</>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div 
                    className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                      hidden
                    />

                    {!file ? (
                      <>
                        <div className={styles.uploadIcon}>🎵</div>
                        <h3>Drop audio or video file here</h3>
                        <p>or click to browse</p>
                        <span className={styles.formats}>MP3, WAV, MP4, WebM (max 25MB)</span>
                      </>
                    ) : (
                      <div className={styles.fileInfo}>
                        <span className={styles.fileIcon}>🎬</span>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>{file.name}</span>
                          <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        <button 
                          className={styles.removeBtn}
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {file && (
                    <button 
                      className={styles.analyzeBtn}
                      onClick={processFile}
                      disabled={isProcessing}
                      style={{ width: '100%', marginTop: '1rem' }}
                    >
                      {isProcessing ? (
                        <><span className={styles.spinner} /> Transcribing...</>
                      ) : (
                        <>🎯 Transcribe & Analyze</>
                      )}
                    </button>
                  )}
                </>
              )}

              {error && (
                <div className={styles.error}>⚠️ {error}</div>
              )}
            </div>
          )}

          {activeTab === 'transcript' && transcript && (
            <div className={styles.transcriptTab}>
              <div className={styles.transcriptToolbar}>
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                  className={styles.langSelect}
                >
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={exportContent}>
                  📥 Export
                </button>
              </div>
              <div className={styles.transcriptContent}>
                {isTranslating ? (
                  <p className={styles.translating}>Translating...</p>
                ) : (
                  <p>{translatedText}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'summary' && analysis && (
            <div className={styles.summaryTab}>
              <div className={styles.summaryBox}>
                <h3>📋 Summary</h3>
                <p>{analysis.summary}</p>
              </div>
              {analysis.keyPoints.length > 0 && (
                <div className={styles.keyPointsBox}>
                  <h3>💡 Key Points</h3>
                  <ul>
                    {analysis.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && analysis && (
            <div className={styles.actionsTab}>
              <h3>Action Items</h3>
              {analysis.actionItems.length === 0 ? (
                <p className={styles.noActions}>No action items detected in this text.</p>
              ) : (
                <ul className={styles.actionList}>
                  {analysis.actionItems.map((action, i) => (
                    <li key={i} className={styles.actionItem}>
                      <input type="checkbox" id={`action-${i}`} />
                      <label htmlFor={`action-${i}`}>{action}</label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {transcript && (
          <div className={styles.bottomActions}>
            <button className="btn btn-secondary" onClick={clearAll}>
              🔄 Start Over
            </button>
            <button className="btn btn-primary" onClick={exportContent}>
              📥 Export All
            </button>
          </div>
        )}
      </div>
    </>
  );
}
