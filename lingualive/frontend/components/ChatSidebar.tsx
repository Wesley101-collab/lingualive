import { useState, useRef, useEffect } from 'react';
import styles from './ChatSidebar.module.css';

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOwn?: boolean;
}

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
}

export function ChatSidebar({ messages, onSendMessage, isOpen, onToggle, userName = 'You' }: ChatSidebarProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <>
      <button className={styles.toggleBtn} onClick={onToggle}>
        💬
        {messages.length > 0 && <span className={styles.badge}>{messages.length}</span>}
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Chat</h3>
          <button className={styles.closeBtn} onClick={onToggle}>×</button>
        </div>

        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.empty}>
              <span>💬</span>
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.isOwn ? styles.own : ''}`}
              >
                <span className={styles.sender}>{msg.isOwn ? 'You' : msg.sender}</span>
                <p className={styles.text}>{msg.text}</p>
                <span className={styles.time}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
          />
          <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
