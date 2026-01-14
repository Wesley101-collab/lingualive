import { useState, useEffect } from 'react';
import styles from './Reactions.module.css';

interface Reaction {
  id: string;
  emoji: string;
  x: number;
}

interface ReactionsProps {
  onSendReaction?: (emoji: string) => void;
  incomingReactions?: Reaction[];
}

const REACTION_EMOJIS = ['👍', '👏', '❓', '💡', '🎉', '❤️'];

export function ReactionButtons({ onSendReaction }: { onSendReaction: (emoji: string) => void }) {
  return (
    <div className={styles.reactionBar}>
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          className={styles.reactionBtn}
          onClick={() => onSendReaction(emoji)}
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function ReactionOverlay({ reactions }: { reactions: Reaction[] }) {
  return (
    <div className={styles.reactionOverlay}>
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className={styles.floatingReaction}
          style={{ left: `${reaction.x}%` }}
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}

export function useReactions() {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const addReaction = (emoji: string) => {
    const id = Date.now().toString();
    const x = 20 + Math.random() * 60; // Random position 20-80%
    setReactions((prev) => [...prev, { id, emoji, x }]);

    // Remove after animation
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  return { reactions, addReaction };
}
