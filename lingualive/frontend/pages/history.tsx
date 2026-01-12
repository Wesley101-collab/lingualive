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
            <span className={styles.statIcon}>📋</span>
            <div>
              <span className={styles.statValue}>{sessions.length}</span>
              <span className={styles.statLabel}>Sessions</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>💬</span>
            <div>
              <span className={styles.statValue}>{totalCaptions}</span>
              <span className={styles.statLabel}>Total Captions</span>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <h3>No sessions yet</h3>
            <p>Start a live transcription session to see your history here.</p>
            <Link href="/speaker" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              🎤 Start Speaking
            </Link>
          </div>
        ) : (
          <>
            {/* Search & Actions */}
            <div className={styles.toolbar}>
              <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={clearAllSessions}>
                🗑️ Clear All
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
                        <span className="badge">{session.language}</span>
                        <div className={styles.sessionActions}>
                          <button 
                            className={styles.actionBtn}
                            onClick={(e) => { e.stopPropagation(); exportSession(session); }}
                            title="Export"
                          >
                            📥
                          </button>
                          <button 
                            className={styles.actionBtn}
                            onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                            title="Delete"
                          >
                            🗑️
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
                <button className={styles.closeBtn} onClick={() => setSelectedSession(null)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalMeta}>
                  <span className="badge">{selectedSession.language}</span>
                  <span className="badge">{selectedSession.time}</span>
                  <span className="badge">{selectedSession.captionCount} captions</span>
                </div>
                <div className={styles.transcriptBox}>
                  {selectedSession.captions.map((caption, i) => (
                    <p key={i} className={styles.captionLine}>{caption}</p>
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSession.captions.join('\n\n'));
                    alert('Copied to clipboard!');
                  }}
                >
                  📋 Copy
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => exportSession(selectedSession)}
                >
                  📥 Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
