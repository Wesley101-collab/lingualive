import { useState, useRef } from 'react';
import styles from './VideoUpload.module.css';

interface VideoUploadProps {
  onTranscriptReady: (transcript: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export function VideoUpload({ onTranscriptReady, onProcessing }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const isValidFile = (f: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/webm'];
    if (!validTypes.includes(f.type)) {
      setError('Please upload a video (MP4, WebM) or audio (MP3, WAV) file');
      return false;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('File size must be under 500MB');
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    onProcessing(true);
    setProgress(10);

    try {
      // Extract audio and send to backend for transcription
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setProgress(100);
      onTranscriptReady(data.transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      onProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />
        
        {!file ? (
          <>
            <div className={styles.icon}>📁</div>
            <p className={styles.text}>Drop video or audio file here</p>
            <p className={styles.subtext}>or click to browse</p>
            <p className={styles.formats}>MP4, WebM, MP3, WAV (max 500MB)</p>
          </>
        ) : (
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>🎬</span>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            <button onClick={clearFile} className={styles.clearBtn}>✕</button>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {progress > 0 && progress < 100 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      {file && progress === 0 && (
        <button onClick={processFile} className={styles.processBtn}>
          🎯 Transcribe & Analyze
        </button>
      )}
    </div>
  );
}
