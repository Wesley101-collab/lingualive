import { useState, useCallback, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioStream } from '../hooks/useAudioStream';
import { WS_EVENTS } from '../utils/constants';
import styles from '../styles/Speaker.module.css';

interface Session {
  id: string;
  date: string;
  time: string;
  captionCount: number;
  language: string;
  captions: string[];
}

export default function SpeakerPage() {
  const [captions, setCaptions] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [mounted, setMounted] = useState(false);
  const transcriptBoxRef = useRef<HTMLDivElement>(null);

  // Load captions from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lingualive_current_captions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCaptions(parsed);
        }
      } catch (e) {
        console.error('Failed to load saved captions:', e);
      }
    }
  }, []);

  // Auto-save captions to localStorage when they change
  useEffect(() => {
    if (mounted && captions.length > 0) {
      localStorage.setItem('lingualive_current_captions', JSON.stringify(captions));
    }
  }, [captions, mounted]);

  // Auto-scroll to bottom when new captions arrive
  useEffect(() => {
    if (autoScroll && transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [captions, autoScroll]);

  const handleMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; text?: string; isFinal?: boolean; viewerCount?: number };
    
    if (msg.type === WS_EVENTS.CAPTION_UPDATE && msg.text && msg.isFinal) {
      setCaptions((prev) => [...prev.slice(-29), msg.text!]);
      setSessionSaved(false); // Mark as unsaved when new captions arrive
    }
    
    if (msg.type === WS_EVENTS.CONNECTION_STATUS && msg.viewerCount !== undefined) {
      setViewerCount(msg.viewerCount);
    }
  }, []);

  const { status, send } = useWebSocket({
    role: 'speaker',
    onMessage: handleMessage,
  });

  const handleAudioData = useCallback((base64Data: string) => {
    send({ type: WS_EVENTS.AUDIO_DATA, data: base64Data });
  }, [send]);

  const { isStreaming, error, startStream, stopStream } = useAudioStream({
    onAudioData: handleAudioData,
  });

  const handleToggleSpeaking = async () => {
    if (isSpeaking) {
      stopStream();
      send({ type: WS_EVENTS.SPEAKER_STOP });
      setIsSpeaking(false);
    } else {
      await startStream();
      send({ type: WS_EVENTS.SPEAKER_START });
      setIsSpeaking(true);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/viewer`;
    navigator.clipboard.writeText(url);
    alert('Viewer link copied to clipboard!');
  };

  const exportTranscript = () => {
    if (captions.length === 0) return;
    const content = captions.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToHistory = () => {
    if (captions.length === 0) return;
    
    const now = new Date();
    const session: Session = {
      id: Date.now().toString(),
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      captionCount: captions.length,
      language: 'English',
      captions: [...captions],
    };

    // Load existing sessions
    const saved = localStorage.getItem('lingualive_sessions');
    const sessions: Session[] = saved ? JSON.parse(saved) : [];
    
    // Add new session at the beginning
    sessions.unshift(session);
    
    // Keep only last 50 sessions
    const trimmed = sessions.slice(0, 50);
    
    localStorage.setItem('lingualive_sessions', JSON.stringify(trimmed));
    setSessionSaved(true);
    alert('Session saved to history!');
  };

  const clearCaptions = () => {
    if (captions.length > 0 && !sessionSaved) {
      if (!confirm('Clear transcript without saving? This cannot be undone.')) {
        return;
      }
    }
    setCaptions([]);
    setSessionSaved(false);
    localStorage.removeItem('lingualive_current_captions');
  };

  return (
    <>
      <Head>
        <title>Live Speaker - LinguaLive</title>
      </Head>

      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Live Speaker</h1>
            <p className={styles.subtitle}>Start speaking to generate real-time captions</p>
          </div>
          <div className={styles.headerActions}>
            <div className={`${styles.statusBadge} ${status === 'connected' ? styles.connected : ''}`}>
              <span className={styles.statusDot} />
              {status === 'connected' ? 'Connected' : 'Connecting...'}
            </div>
            {viewerCount > 0 && (
              <div className={styles.viewerBadge}>
                👁️ {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </header>

        {/* Main Control */}
        <section className={styles.controlSection}>
          <button
            className={`${styles.micButton} ${isSpeaking && isStreaming ? styles.active : ''}`}
            onClick={handleToggleSpeaking}
            disabled={status !== 'connected'}
          >
            <span className={styles.micIcon}>{isSpeaking && isStreaming ? '⏹️' : '🎤'}</span>
            <span className={styles.micLabel}>
              {isSpeaking && isStreaming ? 'Stop Speaking' : 'Start Speaking'}
            </span>
          </button>

          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {isSpeaking && isStreaming && (
            <div className={styles.listeningIndicator}>
              <span className={styles.pulsingDot} />
              <span>Listening... Speak now</span>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <button className="btn btn-secondary" onClick={copyShareLink}>
            🔗 Copy Viewer Link
          </button>
          <button 
            className={`btn btn-secondary ${autoScroll ? styles.activeBtn : ''}`}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            📜 {autoScroll ? 'Auto-scroll On' : 'Auto-scroll Off'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={exportTranscript}
            disabled={captions.length === 0}
          >
            📥 Export
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={saveToHistory}
            disabled={captions.length === 0 || sessionSaved}
          >
            {sessionSaved ? '✓ Saved' : '💾 Save to History'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={clearCaptions}
            disabled={captions.length === 0}
          >
            🗑️ Clear
          </button>
        </section>

        {/* Live Transcript */}
        <section className={styles.transcriptSection}>
          <div className={styles.sectionHeader}>
            <h2>Live Transcript</h2>
            {captions.length > 0 && (
              <span className="badge">{captions.length} captions</span>
            )}
          </div>

          <div className={styles.transcriptBox} ref={transcriptBoxRef}>
            {captions.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>💬</span>
                <p>Your transcript will appear here</p>
                <p className={styles.emptyHint}>Click the microphone button to start</p>
              </div>
            ) : (
              <div className={styles.captionsList}>
                {captions.map((caption, i) => (
                  <p key={i} className={styles.caption}>{caption}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
