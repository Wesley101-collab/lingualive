import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onToggleMic?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onClear?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onToggleMic,
  onSave,
  onExport,
  onClear,
  enabled = true,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space - Toggle microphone
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && onToggleMic) {
        e.preventDefault();
        onToggleMic();
      }

      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && onSave) {
        e.preventDefault();
        onSave();
      }

      // Ctrl/Cmd + E - Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && onExport) {
        e.preventDefault();
        onExport();
      }

      // Ctrl/Cmd + Shift + C - Clear
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C' && onClear) {
        e.preventDefault();
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onToggleMic, onSave, onExport, onClear]);
}

export function KeyboardShortcutsHelp() {
  return (
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
      <strong>Shortcuts:</strong> Space = Mic | Ctrl+S = Save | Ctrl+E = Export
    </div>
  );
}
