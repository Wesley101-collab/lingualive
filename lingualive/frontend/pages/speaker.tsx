import { useState, useCallback, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioStream } from '../hooks/useAudioStream';
import { WS_EVENTS } from '../utils/constants';
import { useKeyboardShortcuts } from '../components/KeyboardShortcuts';
import { SessionStats } from '../components/SessionStats';
import { ReactionOverlay, useReactions } from '../components/Reactions';
import { useSoundNotifications } from '../components/SoundNotifications';
import { generateRoomCode } from '../components/SessionRoom';
import { useOfflineMode, OfflineIndicator } from '../hooks/useOfflineMode';
import { QRCodeShare } from '../components/QRCodeShare';
import { highlightKeywords } from '../utils/highlightKeywords';
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
  const [showStats, setShowStats] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const [smartFormat, setSmartFormat] = useState(true);
  const [formatQueue, setFormatQueue] = useState<Map<number, string>>(new Map());
  const transcriptBoxRef = useRef<HTMLDivElement>(null);

  const { reactions, addReaction } = useReactions();
  const { playNotification } = useSoundNotifications(soundEnabled);
  const { isOnline, pendingCount } = useOfflineMode();

  // Smart formatting function
  const formatCaption = useCallback(async (text: string, index: number) => {
    if (!smartFormat) return text;
    try {
      const res = await fetch('/api/format-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, useAI: true }),
      });
      if (res.ok) {
        const { formatted } = await res.json();
        return formatted;
      }
    } catch {}
    return text;
  }, [smartFormat]);

  useEffect(() => {
    setMounted(true);
    setRoomCode(generateRoomCode());
    const saved = localStorage.getItem('lingualive_current_captions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCaptions(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (mounted && captions.length > 0) {
      localStorage.setItem('lingualive_current_captions', JSON.stringify(captions));
    }
  }, [captions, mounted]);

  useEffect(() => {
    if (autoScroll && transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [captions, autoScroll]);

  const handleMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; text?: string; isFinal?: boolean; viewerCount?: number; emoji?: string };
    if (msg.type === WS_EVENTS.CAPTION_UPDATE && msg.text && msg.isFinal) {
      const captionIndex = captions.length;
      const rawText = msg.text;
      
      // Add caption immediately
      setCaptions((prev) => [...prev.slice(-49), rawText]);
      setSessionSaved(false);
      
      // Format in background if enabled
      if (smartFormat) {
        formatCaption(rawText, captionIndex).then((formatted) => {
          if (formatted !== rawText) {
            setCaptions((prev) => {
              const updated = [...prev];
              const idx = updated.indexOf(rawText);
              if (idx !== -1) updated[idx] = formatted;
              return updated;
            });
          }
        });
      }
    }
    if (msg.type === WS_EVENTS.CONNECTION_STATUS && msg.viewerCount !== undefined) {
      const prev = viewerCount;
      setViewerCount(msg.viewerCount);
      if (msg.viewerCount > prev) playNotification('connect');
      else if (msg.viewerCount < prev) playNotification('disconnect');
    }
    if (msg.type === 'REACTION' && msg.emoji) {
      addReaction(msg.emoji);
      playNotification('reaction');
    }
  }, [viewerCount, playNotification, addReaction, smartFormat, formatCaption, captions.length]);

  const { status, send } = useWebSocket({ role: 'speaker', onMessage: handleMessage });
  const handleAudioData = useCallback((base64Data: string) => {
    send({ type: WS_EVENTS.AUDIO_DATA, timestamp: Date.now(), data: base64Data });
  }, [send]);
  const { isStreaming, error, startStream, stopStream } = useAudioStream({ onAudioData: handleAudioData });

  const handleToggleSpeaking = async () => {
    if (isSpeaking) {
      console.log('[Speaker] Stopping...');
      send({ type: WS_EVENTS.SPEAKER_STOP, timestamp: Date.now() });
      stopStream();
      setIsSpeaking(false);
    } else {
      console.log('[Speaker] Starting... Status:', status);
      
      // Send SPEAKER_START first, before audio starts
      console.log('[Speaker] >>> Sending SPEAKER_START message <<<');
      send({ type: WS_EVENTS.SPEAKER_START, timestamp: Date.now() });
      
      // Small delay to ensure message is sent before audio flood
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[Speaker] Starting audio stream');
      await startStream();
      setIsSpeaking(true);
      setSessionStartTime(new Date());
    }
  };

  const copyShareLink = async () => {
    const link = `${window.location.origin}/viewer?room=${roomCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Fallback for mobile/older browsers
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const exportTranscript = () => {
    if (captions.length === 0) return;
    const blob = new Blob([captions.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToHistory = () => {
    if (captions.length === 0) return;
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      captionCount: captions.length,
      language: 'English',
      captions: [...captions],
    };
    const saved = localStorage.getItem('lingualive_sessions');
    const sessions: Session[] = saved ? JSON.parse(saved) : [];
    sessions.unshift(session);
    localStorage.setItem('lingualive_sessions', JSON.stringify(sessions.slice(0, 50)));
    setSessionSaved(true);
  };

  const clearCaptions = () => {
    if (captions.length === 0) return;
    
    setCaptions([]);
    setSessionSaved(false);
    setSessionStartTime(null);
    localStorage.removeItem('lingualive_current_captions');
  };

  useKeyboardShortcuts({
    onToggleMic: handleToggleSpeaking,
    onSave: saveToHistory,
    onExport: exportTranscript,
    onClear: clearCaptions,
    enabled: status === 'connected',
  });

  const isActive = isSpeaking && isStreaming;

  return (
    <>
      <Head><title>Speaker - LinguaLive</title></Head>
      <div className={styles.page}>
        <ReactionOverlay reactions={reactions} />
        <OfflineIndicator isOnline={isOnline} pendingCount={pendingCount} />

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Live Speaker</h1>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${status === 'connected' ? styles.connected : ''}`}>
              <span className={styles.dot} />
              {status === 'connected' ? 'Connected' : 'Connecting'}
            </span>
            {viewerCount > 0 && <span className={styles.badge}>{viewerCount} viewing</span>}
          </div>
        </header>

        {/* Room Code */}
        <div className={styles.roomCard}>
          <div className={styles.roomInfo}>
            <span className={styles.roomLabel}>Room</span>
            <button 
              className={styles.roomCode} 
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(roomCode);
                  alert('Room code copied!');
                } catch {
                  prompt('Copy room code:', roomCode);
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title="Click to copy room code"
            >
              {roomCode}
            </button>
          </div>
          <div className={styles.roomActions}>
            <button className={styles.qrBtn} onClick={() => setShowQR(!showQR)} title="Show QR Code">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h-4v-4h2v-2h-2v-2h4v4zm2 0h2v4h-2v-4zm0-2v-2h2v2h-2z"/>
              </svg>
            </button>
            <button className={styles.copyBtn} onClick={copyShareLink}>
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className={styles.qrModal} onClick={() => setShowQR(false)}>
            <div className={styles.qrContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.qrClose} onClick={() => setShowQR(false)}>×</button>
              <h3>Scan to Join</h3>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/viewer?room=${roomCode}`)}`}
                alt="QR Code"
                className={styles.qrImage}
              />
              <p className={styles.qrRoom}>Room: {roomCode}</p>
            </div>
          </div>
        )}

        {/* Mic Control */}
        <div className={styles.micSection}>
          <button
            className={`${styles.micBtn} ${isActive ? styles.active : ''}`}
            onClick={handleToggleSpeaking}
            disabled={status !== 'connected'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.micIcon}>
              {isActive ? (
                <rect x="6" y="6" width="12" height="12" rx="2" />
              ) : (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
              )}
            </svg>
          </button>
          <p className={styles.micLabel}>{isActive ? 'Recording...' : 'Tap to Start'}</p>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${autoScroll ? styles.on : ''}`} onClick={() => setAutoScroll(!autoScroll)}>
            Scroll
          </button>
          <button className={`${styles.actionBtn} ${smartFormat ? styles.on : ''}`} onClick={() => setSmartFormat(!smartFormat)} title="AI punctuation & grammar">
            Format
          </button>
          <button className={`${styles.actionBtn} ${highlightEnabled ? styles.on : ''}`} onClick={() => setHighlightEnabled(!highlightEnabled)}>
            Highlight
          </button>
          <button className={`${styles.actionBtn} ${showStats ? styles.on : ''}`} onClick={() => setShowStats(!showStats)}>
            Stats
          </button>
          <button className={`${styles.actionBtn} ${soundEnabled ? styles.on : ''}`} onClick={() => setSoundEnabled(!soundEnabled)}>
            Sound
          </button>
        </div>

        {/* Stats */}
        {showStats && captions.length > 0 && (
          <SessionStats captions={captions} startTime={sessionStartTime || undefined} />
        )}

        {/* Transcript */}
        <div className={styles.transcript}>
          <div className={styles.transcriptHeader}>
            <span>Transcript</span>
            <span className={styles.count}>{captions.length}</span>
          </div>
          <div className={styles.transcriptBody} ref={transcriptBoxRef}>
            {captions.length === 0 ? (
              <p className={styles.empty}>Captions will appear here when you start speaking</p>
            ) : (
              captions.map((c, i) => (
                <p 
                  key={i} 
                  className={styles.caption}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightEnabled ? highlightKeywords(c) : c 
                  }}
                />
              ))
            )}
          </div>
          <div className={styles.transcriptFooter}>
            <button className={styles.footerBtn} onClick={exportTranscript} disabled={captions.length === 0}>Export</button>
            <button className={styles.footerBtn} onClick={saveToHistory} disabled={captions.length === 0 || sessionSaved}>
              {sessionSaved ? 'Saved' : 'Save'}
            </button>
            <button className={`${styles.footerBtn} ${styles.danger}`} onClick={clearCaptions} disabled={captions.length === 0}>Clear</button>
          </div>
        </div>
      </div>
    </>
  );
}
