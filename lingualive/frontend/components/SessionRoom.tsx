import { useState } from 'react';
import styles from './SessionRoom.module.css';

interface SessionRoomProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateRoom: () => string;
  currentRoom?: string;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function SessionRoomJoin({ onJoinRoom }: { onJoinRoom: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    setError('');
    onJoinRoom(cleanCode);
  };

  return (
    <form className={styles.joinForm} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          maxLength={6}
          className={styles.codeInput}
        />
        <button type="submit" className={styles.joinBtn}>
          Join Room
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}

export function SessionRoomDisplay({ roomCode, onCopy }: { roomCode: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className={styles.roomDisplay}>
      <span className={styles.label}>Room Code</span>
      <div className={styles.codeBox}>
        <span className={styles.code}>{roomCode}</span>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  );
}

export function SessionRoomCreate({ onCreate }: { onCreate: (code: string) => void }) {
  const handleCreate = () => {
    const code = generateRoomCode();
    onCreate(code);
  };

  return (
    <button className={styles.createBtn} onClick={handleCreate}>
      🎤 Create New Room
    </button>
  );
}
