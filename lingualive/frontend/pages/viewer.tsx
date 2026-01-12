import { useState, useCallback, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { WS_EVENTS, SUPPORTED_LANGUAGES, LanguageCode } from '../utils/constants';
import styles from '../styles/Viewer.module.css';

export default function ViewerPage() {
  const [captions, setCaptions] = useState<string[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [fontSize, setFontSize] = useState(18);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const captionBoxRef = useRef<HTMLDivElement>(null);
  const lastCaptionRef = useRef<string>('');

  const { 
    isSupported: ttsSupported, 
    isEnabled: listenMode, 
    isSpeaking,
    toggle: toggleListenMode,
    queueSpeak,
    stop: stopSpeaking
  } = useTextToSpeech({ 
    language, 
    rate: speechRate 
  });

  const handleMessage = useCallback((data: unknown) => {
    const msg = data as { type: string; text?: string; isFinal?: boolean };
    
    if (msg.type === WS_EVENTS.CAPTION_UPDATE && msg.text && msg.isFinal) {
      setCaptions((prev) => [...prev.slice(-49), msg.text!]);
      
      // Speak new caption if listen mode is enabled
      if (listenMode && msg.text !== lastCaptionRef.current) {
        lastCaptionRef.current = msg.text;
        queueSpeak(msg.text);
      }
    }
  }, [listenMode, queueSpeak]);

  const { status, send } = useWebSocket({
    role: 'viewer',
    onMessage: handleMessage,
  });

  useEffect(() => {
    if (status === 'connected') {
      send({ type: WS_EVENTS.LANGUAGE_SELECT, language });
    }
  }, [status, send, language]);

  useEffect(() => {
    if (autoScroll && captionBoxRef.current) {
      captionBoxRef.current.scrollTop = captionBoxRef.current.scrollHeight;
    }
  }, [captions, autoScroll]);

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    setCaptions([]);
    stopSpeaking(); // Stop any ongoing speech when language changes
  };

  const handleToggleListenMode = () => {
    toggleListenMode();
    if (listenMode) {
      stopSpeaking();
    }
  };

  // Accessibility mode - full screen captions
  if (isAccessibilityMode) {
    return (
      <div className={styles.accessibilityMode}>
        <Head>
          <title>Captions - LinguaLive</title>
        </Head>
        <header className={styles.accessibilityHeader}>
          <h2>🌐 LinguaLive</h2>
          <div className={styles.accessibilityControls}>
            {ttsSupported && (
              <button 
                className={`${styles.listenBtnLarge} ${listenMode ? styles.active : ''}`}
                onClick={handleToggleListenMode}
              >
                {listenMode ? '🔊 Listening' : '🔇 Listen'}
              </button>
            )}
            <button className={styles.exitBtn} onClick={() => setIsAccessibilityMode(false)}>
              Exit Full Screen
            </button>
          </div>
        </header>
        <div className={styles.accessibilityContent}>
          <p className={styles.accessibilityCaption} style={{ fontSize: `${fontSize * 2}px` }}>
            {captions.length > 0 ? captions[captions.length - 1] : 'Waiting for captions...'}
          </p>
          {isSpeaking && (
            <div className={styles.speakingIndicator}>
              <span className={styles.soundWave}>🔊</span>
              Speaking...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Viewer - LinguaLive</title>
      </Head>

      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Live Captions</h1>
            <p className={styles.subtitle}>Real-time translated captions</p>
          </div>
          <div className={styles.headerRight}>
            <div className={`${styles.statusBadge} ${status === 'connected' ? styles.connected : ''}`}>
              <span className={styles.statusDot} />
              {status === 'connected' ? 'Connected' : 'Connecting...'}
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <section className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <span className={styles.toolbarLabel}>Language</span>
            <select 
              className={styles.langSelect}
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          <div className={styles.toolbarGroup}>
            <span className={styles.toolbarLabel}>Size</span>
            <input
              type="range"
              className={styles.fontSlider}
              min="14"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          <div className={styles.toolbarGroup}>
            <button 
              className={`${styles.toggleBtn} ${autoScroll ? styles.active : ''}`}
              onClick={() => setAutoScroll(!autoScroll)}
            >
              📜 Auto-scroll
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button 
              className={styles.toggleBtn}
              onClick={() => setIsAccessibilityMode(true)}
            >
              🖥️ Full Screen
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button 
              className={styles.toggleBtn}
              onClick={() => {
                if (captions.length === 0) {
                  alert('No captions to export yet');
                  return;
                }
                const content = captions.join('\n\n');
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `captions-${language}-${new Date().toISOString().slice(0, 10)}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              disabled={captions.length === 0}
            >
              📥 Export
            </button>
          </div>
        </section>

        {/* Listen Mode Panel */}
        {ttsSupported && (
          <section className={styles.listenPanel}>
            <div className={styles.listenHeader}>
              <div className={styles.listenInfo}>
                <span className={styles.listenIcon}>🎧</span>
                <div>
                  <h3>Listen Mode</h3>
                  <p>Hear captions read aloud in {SUPPORTED_LANGUAGES[language]}</p>
                </div>
              </div>
              <button 
                className={`${styles.listenToggle} ${listenMode ? styles.active : ''}`}
                onClick={handleToggleListenMode}
              >
                {listenMode ? (
                  <><span className={styles.soundIcon}>🔊</span> On</>
                ) : (
                  <><span className={styles.soundIcon}>🔇</span> Off</>
                )}
              </button>
            </div>
            
            {listenMode && (
              <div className={styles.listenControls}>
                <div className={styles.speedControl}>
                  <span>Speed:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                  />
                  <span>{speechRate}x</span>
                </div>
                {isSpeaking && (
                  <div className={styles.speakingBadge}>
                    <span className={styles.pulsingDot} />
                    Speaking...
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Captions Display */}
        <section className={styles.captionSection}>
          <div className={styles.captionHeader}>
            <h2>Captions</h2>
            {captions.length > 0 && (
              <span className="badge badge-primary">{captions.length} received</span>
            )}
          </div>

          <div 
            className={styles.captionBox} 
            ref={captionBoxRef}
            style={{ fontSize: `${fontSize}px` }}
          >
            {captions.length === 0 ? (
              <div className={styles.waitingState}>
                <span className={styles.waitingIcon}>🎤</span>
                <h3>Waiting for speaker...</h3>
                <p>Captions will appear here when the speaker starts talking</p>
                {listenMode && (
                  <p className={styles.listenHint}>🎧 Listen mode is on - you'll hear captions read aloud</p>
                )}
              </div>
            ) : (
              <div className={styles.captionsList}>
                {captions.map((caption, i) => (
                  <p key={i} className={styles.caption}>{caption}</p>
                ))}
              </div>
            )}
          </div>

          {captions.length > 0 && (
            <div className={styles.statsBar}>
              <span>Language: {SUPPORTED_LANGUAGES[language]}</span>
              <span>Font size: {fontSize}px</span>
              {listenMode && <span>🎧 Listen mode on</span>}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
