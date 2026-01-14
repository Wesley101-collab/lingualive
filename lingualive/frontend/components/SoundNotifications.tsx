import { useEffect, useRef, useCallback } from 'react';

type NotificationType = 'connect' | 'disconnect' | 'reaction' | 'hand';

// Simple audio context for generating notification sounds
export function useSoundNotifications(enabled = true) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound notification failed:', e);
    }
  }, [enabled, getAudioContext]);

  const playNotification = useCallback((type: NotificationType) => {
    switch (type) {
      case 'connect':
        // Rising tone
        playTone(440, 0.15);
        setTimeout(() => playTone(554, 0.15), 100);
        setTimeout(() => playTone(659, 0.2), 200);
        break;
      case 'disconnect':
        // Falling tone
        playTone(659, 0.15);
        setTimeout(() => playTone(554, 0.15), 100);
        setTimeout(() => playTone(440, 0.2), 200);
        break;
      case 'reaction':
        // Quick blip
        playTone(880, 0.1);
        break;
      case 'hand':
        // Double blip
        playTone(660, 0.1);
        setTimeout(() => playTone(660, 0.1), 150);
        break;
    }
  }, [playTone]);

  return { playNotification };
}

// Toggle component
interface SoundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        padding: '0.5rem 0.75rem',
        background: enabled ? 'var(--primary-light)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      title={enabled ? 'Sound notifications on' : 'Sound notifications off'}
    >
      {enabled ? '🔔' : '🔕'}
      <span>Sounds</span>
    </button>
  );
}
