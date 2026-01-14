import { useState, useEffect, useCallback } from 'react';

interface OfflineCaption {
  id: string;
  text: string;
  timestamp: string;
  synced: boolean;
}

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCaptions, setPendingCaptions] = useState<OfflineCaption[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingCaptions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = localStorage.getItem('lingualive_pending_captions');
    if (saved) {
      try {
        setPendingCaptions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load pending captions:', e);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineCaption = useCallback((text: string) => {
    const caption: OfflineCaption = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    setPendingCaptions((prev) => {
      const updated = [...prev, caption];
      localStorage.setItem('lingualive_pending_captions', JSON.stringify(updated));
      return updated;
    });

    return caption;
  }, []);

  const syncPendingCaptions = useCallback(async () => {
    const saved = localStorage.getItem('lingualive_pending_captions');
    if (!saved) return;

    try {
      const captions: OfflineCaption[] = JSON.parse(saved);
      const unsynced = captions.filter((c) => !c.synced);

      if (unsynced.length === 0) return;

      const synced = captions.map((c) => ({ ...c, synced: true }));
      localStorage.setItem('lingualive_pending_captions', JSON.stringify(synced));
      setPendingCaptions(synced);

      console.log(`Synced ${unsynced.length} offline captions`);
    } catch (e) {
      console.error('Failed to sync captions:', e);
    }
  }, []);

  const clearSyncedCaptions = useCallback(() => {
    setPendingCaptions((prev) => {
      const unsynced = prev.filter((c) => !c.synced);
      localStorage.setItem('lingualive_pending_captions', JSON.stringify(unsynced));
      return unsynced;
    });
  }, []);

  return {
    isOnline,
    pendingCaptions,
    pendingCount: pendingCaptions.filter((c) => !c.synced).length,
    saveOfflineCaption,
    syncPendingCaptions,
    clearSyncedCaptions,
  };
}

export function OfflineIndicator({ isOnline, pendingCount }: { isOnline: boolean; pendingCount: number }) {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '0.75rem 1rem',
        background: isOnline ? 'var(--success)' : 'var(--warning)',
        color: 'white',
        borderRadius: 'var(--radius)',
        fontSize: '0.875rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {isOnline ? (
        <>
          <span>✓</span>
          <span>Back online! Syncing {pendingCount} captions...</span>
        </>
      ) : (
        <>
          <span>📴</span>
          <span>Offline mode • {pendingCount} pending</span>
        </>
      )}
    </div>
  );
}
