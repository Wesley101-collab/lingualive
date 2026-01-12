import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
};

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const queueRef = useRef<string[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { 
    language = 'en', 
    rate = 1, 
    pitch = 1, 
    volume = 1 
  } = options;

  // Check support and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Get best voice for language
  const getVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const langCode = LANGUAGE_VOICE_MAP[lang] || lang;
    
    // Try to find a voice that matches the language
    let voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    
    // Prefer natural/premium voices
    const premiumVoice = voices.find(v => 
      v.lang.startsWith(langCode.split('-')[0]) && 
      (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Enhanced'))
    );
    
    if (premiumVoice) voice = premiumVoice;
    
    return voice || null;
  }, [voices]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!isSupported || !isEnabled || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoice(language);
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = LANGUAGE_VOICE_MAP[language] || 'en-US';
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Process next in queue
      if (queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        if (next) speak(next);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    currentUtteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, isEnabled, language, rate, pitch, volume, getVoice]);

  // Queue text (for continuous captions)
  const queueSpeak = useCallback((text: string) => {
    if (!isEnabled) return;
    
    if (isSpeaking) {
      queueRef.current.push(text);
    } else {
      speak(text);
    }
  }, [isEnabled, isSpeaking, speak]);

  // Stop speaking
  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // Toggle enabled
  const toggle = useCallback(() => {
    if (isEnabled) {
      stop();
    }
    setIsEnabled(!isEnabled);
  }, [isEnabled, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    isEnabled,
    isSpeaking,
    voices,
    speak,
    queueSpeak,
    stop,
    toggle,
    setIsEnabled,
  };
}
