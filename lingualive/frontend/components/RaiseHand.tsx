import { useState } from 'react';
import styles from './RaiseHand.module.css';

interface RaiseHandProps {
  onRaiseHand: (raised: boolean) => void;
  raisedHands?: { id: string; name?: string }[];
  isViewer?: boolean;
}

export function RaiseHandButton({ onRaiseHand }: { onRaiseHand: (raised: boolean) => void }) {
  const [raised, setRaised] = useState(false);

  const handleClick = () => {
    const newState = !raised;
    setRaised(newState);
    onRaiseHand(newState);
  };

  return (
    <button
      className={`${styles.raiseHandBtn} ${raised ? styles.raised : ''}`}
      onClick={handleClick}
      title={raised ? 'Lower hand' : 'Raise hand'}
    >
      <span className={styles.handIcon}>{raised ? '✋' : '🤚'}</span>
      <span>{raised ? 'Hand Raised' : 'Raise Hand'}</span>
    </button>
  );
}

export function RaisedHandsList({ hands }: { hands: { id: string; name?: string }[] }) {
  if (hands.length === 0) return null;

  return (
    <div className={styles.handsList}>
      <span className={styles.handsIcon}>✋</span>
      <span className={styles.handsCount}>{hands.length} hand{hands.length !== 1 ? 's' : ''} raised</span>
    </div>
  );
}
