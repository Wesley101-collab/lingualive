import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/History.module.css';

interface Session {
  id: string;
  date: string;
  time: string;
  captionCount: number;
  language: string;
  captions: string[];
}

// SVG Icons
const Icons = {
  sessions: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  captions: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>,
  empty: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 12H5c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1z"/></svg>,
  mic: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  delete: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>,
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    // Load real sessions from localStorage
    const saved = localStorage.getItem('lingualive_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSessions([]);
      }
    }
  }, []);

  const filteredSessions = sessions.filter(s => 
    s.captions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
    s.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.date.includes(searchQuery)
  );

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('lingualive_sessions', JSON.stringify(updated));
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  const clearAllSessions = () => {
    if (confirm('Delete all session history?')) {
      setSessions([]);
      localStorage.removeItem('lingualive_sessions');
    }
  };

  const exportSession = (session: Session) => {
    const content = `# Session Transcript
Date: ${session.date} ${session.time}
Language: ${session.language}
Captions: ${session.captionCount}

---

${session.captions.join('\n\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${session.date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalCaptions = sessions.reduce((sum, s) => sum + s.captionCount, 0);

  return (
    <>
      <Head>
        <title>History - LinguaLive</title>
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Session History</h1>
            <p className={styles.subtitle}>Your past transcription sessions</p>
          </div>
        </header>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>{Icons.sessions}</span>
            <div>
              <span className={styles.statValue}>{sessions.length}</span>
              <span className={styles.statLabel}>Sessions</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>{Icons.captions}</span>
            <div>
              <span className={styles.statValue}>{totalCaptions}</span>
              <span className={styles.statLabel}>Total Captions</span>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>{Icons.empty}</span>
            <h3>No sessions yet</h3>
            <p>Start a live transcription session to see your history here.</p>
            <Link href="/speaker" className={styles.startBtn}>
              {Icons.mic}
              Start Speaking
            </Link>
          </div>
        ) : (
          <>
            {/* Search & Actions */}
            <div className={styles.toolbar}>
              <div className={styles.searchBar}>
                <span className={styles.searchIcon}>{Icons.search}</span>
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                    {Icons.close}
                  </button>
                )}
              </div>
              <button className={styles.clearAllBtn} onClick={clearAllSessions}>
                {Icons.delete}
                Clear All
              </button>
            </div>

            {/* Sessions List */}
            <section className={styles.sessionsSection}>
              {filteredSessions.length === 0 ? (
                <p className={styles.noResults}>No sessions match your search</p>
              ) : (
                <div className={styles.sessionsList}>
                  {filteredSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className={styles.sessionCard}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className={styles.sessionHeader}>
                        <span className={styles.sessionDate}>{session.date} {session.time}</span>
                        <span className={styles.sessionCount}>{session.captionCount} captions</span>
                      </div>
                      <p className={styles.sessionPreview}>
                        {session.captions.slice(0, 2).join(' ').slice(0, 150)}...
                      </p>
                      <div className={styles.sessionFooter}>
                        <span className={styles.langBadge}>{session.language}</span>
                        <div className={styles.sessionActions}>
                          <button 
                            className={styles.actionBtn}
                            onClick={(e) => { e.stopPropagation(); exportSession(session); }}
                            title="Export"
                          >
                            {Icons.download}
                          </button>
                          <button 
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                            title="Delete"
                          >
                            {Icons.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Session Detail Modal */}
        {selectedSession && (
          <div className={styles.modal} onClick={() => setSelectedSession(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Session - {selectedSession.date}</h3>
                <button className={styles.closeBtn} onClick={() => setSelectedSession(null)}>
                  {Icons.close}
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalMeta}>
                  <span className={styles.metaBadge}>{selectedSession.language}</span>
                  <span className={styles.metaBadge}>{selectedSession.time}</span>
                  <span className={styles.metaBadge}>{selectedSession.captionCount} captions</span>
                </div>
                <div className={styles.transcriptBox}>
                  {selectedSession.captions.map((caption, i) => (
                    <p key={i} className={styles.captionLine}>{caption}</p>
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSession.captions.join('\n\n'));
                    alert('Copied to clipboard!');
                  }}
                >
                  {Icons.copy}
                  Copy
                </button>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => exportSession(selectedSession)}
                >
                  {Icons.download}
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
