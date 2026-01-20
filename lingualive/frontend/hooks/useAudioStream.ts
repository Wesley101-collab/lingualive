import { useRef, useState, useCallback } from 'react';

interface UseAudioStreamOptions {
  onAudioData: (base64Data: string) => void;
}

export function useAudioStream({ onAudioData }: UseAudioStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startStream = useCallback(async () => {
    try {
      setError(null);
      
      // Check if getUserMedia is available (requires HTTPS or localhost)
      if (!navigator.mediaDevices?.getUserMedia) {
        const isLocalhost = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        
        if (!isLocalhost && window.location.protocol !== 'https:') {
          setError('Microphone requires HTTPS. Use localhost on PC or enable HTTPS.');
          return;
        }
        setError('Microphone not supported in this browser');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        // Only process if we're actually streaming
        if (!mediaStreamRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pcmData.buffer))
        );
        onAudioData(base64);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      
      setIsStreaming(true);
    } catch (err) {
      let message = 'Failed to access microphone';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          message = 'Microphone permission denied. Please allow access.';
        } else if (err.name === 'NotFoundError') {
          message = 'No microphone found on this device.';
        } else {
          message = err.message;
        }
      }
      setError(message);
      console.error('Audio stream error:', err);
    }
  }, [onAudioData]);

  const stopStream = useCallback(() => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    processorRef.current = null;
    audioContextRef.current = null;
    mediaStreamRef.current = null;
    
    setIsStreaming(false);
  }, []);

  return { isStreaming, error, startStream, stopStream };
}
