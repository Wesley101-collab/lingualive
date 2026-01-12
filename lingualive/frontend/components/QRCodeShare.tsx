import { useState, useEffect } from 'react';
import styles from './QRCodeShare.module.css';

interface QRCodeShareProps {
  roomCode?: string;
}

export function QRCodeShare({ roomCode }: QRCodeShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = roomCode ? `${baseUrl}/viewer?room=${roomCode}` : `${baseUrl}/viewer`;
    setViewerUrl(url);
  }, [roomCode]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewerUrl)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(viewerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.shareButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Share viewer link"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span>Share</span>
      </button>

      {isOpen && (
        <div className={styles.modal} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
            <h3 className={styles.title}>Share with Viewers</h3>
            
            <div className={styles.qrWrapper}>
              <img src={qrCodeUrl} alt="QR Code for viewer page" className={styles.qrCode} />
            </div>

            <p className={styles.instruction}>Scan QR code or share link:</p>
            
            <div className={styles.linkWrapper}>
              <input 
                type="text" 
                value={viewerUrl} 
                readOnly 
                className={styles.linkInput}
              />
              <button className={styles.copyButton} onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            {roomCode && (
              <div className={styles.roomCode}>
                <span>Room Code:</span>
                <strong>{roomCode}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
