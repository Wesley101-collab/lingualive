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
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Input
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'transcript' ? styles.active : ''}`}
            onClick={() => setActiveTab('transcript')}
            disabled={!transcript}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Transcript
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'summary' ? styles.active : ''}`}
            onClick={() => setActiveTab('summary')}
            disabled={!analysis}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Summary
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'actions' ? styles.active : ''}`}
            onClick={() => setActiveTab('actions')}
            disabled={!analysis}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Actions {analysis && analysis.actionItems.length > 0 && `(${analysis.actionItems.length})`}
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
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Paste Text
                </button>
                <button 
                  className={`${styles.modeBtn} ${inputMode === 'file' ? styles.active : ''}`}
                  onClick={() => setInputMode('file')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                  </svg>
                  Upload File
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
                          <>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                            Analyze with AI
                          </>
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
                        <div className={styles.uploadIcon}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                        </div>
                        <h3>Drop audio or video file here</h3>
                        <p>or click to browse</p>
                        <span className={styles.formats}>MP3, WAV, MP4, WebM (max 25MB)</span>
                      </>
                    ) : (
                      <div className={styles.fileInfo}>
                        <span className={styles.fileIcon}>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                          </svg>
                        </span>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>{file.name}</span>
                          <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                        <button 
                          className={styles.removeBtn}
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
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
                        <>
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Transcribe & Analyze
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {error && (
                <div className={styles.error}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {error}
                </div>
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
                <button className={styles.exportBtn} onClick={exportContent}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  Export
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
                <h3>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  Summary
                </h3>
                <p>{analysis.summary}</p>
              </div>
              {analysis.keyPoints.length > 0 && (
                <div className={styles.keyPointsBox}>
                  <h3>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
                    </svg>
                    Key Points
                  </h3>
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
            <button className={styles.secondaryBtn} onClick={clearAll}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Start Over
            </button>
            <button className={styles.primaryBtn} onClick={exportContent}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Export All
            </button>
          </div>
        )}
      </div>
    </>
  );
}
