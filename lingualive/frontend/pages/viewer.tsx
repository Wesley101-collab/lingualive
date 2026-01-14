import { useState, useCallback, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { WS_EVENTS, SUPPORTED_LANGUAGES, LanguageCode } from '../utils/constants';
import { ReactionOverlay, useReactions } from '../components/Reactions';
import { highlightKeywords } from '../utils/highlightKeywords';
import styles from '../styles/Viewer.module.css';

const STORAGE_KEY = 'lingualive_viewer_captions';
const LANG_STORAGE_KEY = 'lingualive_viewer_language';

export default function ViewerPage() {
  const router = useRouter();
  const [captions, setCaptions] = useState<string[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [fontSize, setFontSize] = useState(18);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(true);
  const captionBoxRef = useRef<HTMLDivElement>(null);
  const lastCaptionRef = useRef<string>('');

  const { reactions, addReaction } = useReactions();
  const { isSupported: ttsSupported, isEnabled: listenMode, isSpeaking, toggle: toggleListenMode, queueSpeak, stop: stopSpeaking } = useTextToSpeech({ language });

  // Wait for router to be ready and check for room in URL
  useEffect(() => {
    if (!router.isReady) return;
    
    // Load saved language
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode;
    if (savedLang && SUPPORTED_LANGUAGES[savedLang]) {
      setLanguage(savedLang);
    }
    
    const roomFromUrl = router.query.room as string;
    if (roomFromUrl) {
      setRoomCode(roomFromUrl);
      setIsJoined(true);
      // Load saved captions for this room
      const saved = localStorage.getItem(`${STORAGE_KEY}_${roomFromUrl}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setCaptions(parsed);
        } catch {}
      }
    }
    setIsReady(true);
  }, [router.isReady, router.query.room]);

  // Save captions to localStorage when they change
  useEffect(() => {
    if (roomCode && captions.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${roomCode}`, JSON.stringify(captions));
    }
  }, [captions, roomCode]);

  const handleMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; text?: string; isFinal?: boolean; emoji?: string };
    if (msg.type === WS_EVENTS.CAPTION_UPDATE && msg.text && msg.isFinal) {
      setCaptions((prev) => [...prev.slice(-49), msg.text!]);
      if (listenMode && msg.text !== lastCaptionRef.current) {
        lastCaptionRef.current = msg.text;
        queueSpeak(msg.text);
      }
    }
    if (msg.type === 'REACTION' && msg.emoji) addReaction(msg.emoji);
  }, [listenMode, queueSpeak, addReaction]);

  const { status, send } = useWebSocket({ role: 'viewer', onMessage: handleMessage });

  useEffect(() => {
    if (status === 'connected') send({ type: WS_EVENTS.LANGUAGE_SELECT, language });
  }, [status, send, language]);

  useEffect(() => {
    if (autoScroll && captionBoxRef.current) {
      captionBoxRef.current.scrollTop = captionBoxRef.current.scrollHeight;
    }
  }, [captions, autoScroll]);

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    setCaptions([]);
    stopSpeaking();
    if (roomCode) {
      localStorage.removeItem(`${STORAGE_KEY}_${roomCode}`);
    }
  };

  const leaveRoom = () => {
    if (roomCode) {
      localStorage.removeItem(`${STORAGE_KEY}_${roomCode}`);
    }
    setCaptions([]);
    setRoomCode('');
    setIsJoined(false);
    stopSpeaking();
    router.push('/viewer', undefined, { shallow: true });
  };

  const exportCaptions = () => {
    if (captions.length === 0) return;
    const blob = new Blob([captions.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions-${language}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Join screen - wait for router to be ready
  if (!isReady) {
    return (
      <>
        <Head><title>Loading - LinguaLive</title></Head>
        <div className={styles.joinPage}>
          <div className={styles.joinCard}>
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isJoined) {
    return (
      <>
        <Head><title>Join - LinguaLive</title></Head>
        <div className={styles.joinPage}>
          <div className={styles.joinCard}>
            <h1 className={styles.joinTitle}>Join Session</h1>
            <p className={styles.joinDesc}>Enter the room code from the speaker</p>
            <form className={styles.joinForm} onSubmit={(e) => {
              e.preventDefault();
              const code = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (code.length >= 4) {
                setIsJoined(true);
                router.push(`/viewer?room=${code}`, undefined, { shallow: true });
              }
            }}>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                className={styles.joinInput}
                maxLength={6}
              />
              <button type="submit" className={styles.joinBtn}>Join</button>
            </form>
            <div className={styles.divider}><span>or</span></div>
            <button className={styles.skipBtn} onClick={() => setIsJoined(true)}>
              Continue without code
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Viewer - LinguaLive</title></Head>
      <div className={styles.page}>
        <ReactionOverlay reactions={reactions} />

        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Live Captions</h1>
            {roomCode && <span className={styles.roomBadge}>Room: {roomCode}</span>}
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.badge} ${status === 'connected' ? styles.connected : ''}`}>
              <span className={styles.dot} />
              {status === 'connected' ? 'Connected' : 'Connecting'}
            </span>
            <button className={styles.leaveBtn} onClick={leaveRoom}>
              Leave
            </button>
          </div>
        </header>

        {/* Controls */}
        <div className={styles.controls}>
          <select 
            className={styles.langSelect}
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
          
          <div className={styles.sizeControl}>
            <span className={styles.sizeLabel}>A</span>
            <input
              type="range"
              min="14"
              max="28"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={styles.sizeSlider}
            />
            <span className={styles.sizeLabelLg}>A</span>
          </div>
        </div>

        {/* Options */}
        <div className={styles.options}>
          <button 
            className={`${styles.optionBtn} ${autoScroll ? styles.on : ''}`}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            Scroll
          </button>
          <button 
            className={`${styles.optionBtn} ${highlightEnabled ? styles.on : ''}`}
            onClick={() => setHighlightEnabled(!highlightEnabled)}
          >
            Highlight
          </button>
          {ttsSupported && (
            <button 
              className={`${styles.optionBtn} ${listenMode ? styles.on : ''}`}
              onClick={() => { toggleListenMode(); if (listenMode) stopSpeaking(); }}
            >
              Listen
            </button>
          )}
          <button 
            className={styles.optionBtn}
            onClick={exportCaptions}
            disabled={captions.length === 0}
          >
            Export
          </button>
        </div>

        {/* Captions */}
        <div className={styles.captionCard}>
          <div className={styles.captionHeader}>
            <span>Captions</span>
            <span className={styles.count}>{captions.length}</span>
          </div>
          <div 
            className={styles.captionBody} 
            ref={captionBoxRef}
            style={{ fontSize: `${fontSize}px` }}
          >
            {captions.length === 0 ? (
              <div className={styles.empty}>
                <p>Waiting for speaker...</p>
                <p className={styles.hint}>Captions appear here automatically</p>
              </div>
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
          {isSpeaking && (
            <div className={styles.speaking}>Speaking...</div>
          )}
        </div>
      </div>
    </>
  );
}
