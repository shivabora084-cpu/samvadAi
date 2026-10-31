import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);
  const [muted, setMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  const onEndCallbackRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getBestVoice = useCallback((langCode) => {
    if (!voices.length) return null;

    const langPrefix = langCode === 'hi' ? 'hi' : langCode === 'ta' ? 'ta' : 'en';

    // 1. Try exact Indian regional voice
    const indianVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(`${langPrefix}-in`)
    );
    if (indianVoice) return indianVoice;

    // 2. Try any voice starting with language code
    const langVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(langPrefix)
    );
    if (langVoice) return langVoice;

    // 3. Fallback to default
    return voices.find((v) => v.default) || voices[0];
  }, [voices]);

  const speak = useCallback((text, langCode = 'en', onEnd = null) => {
    if (!('speechSynthesis' in window) || muted || !text) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    onEndCallbackRef.current = onEnd;

    // Clean markdown/special characters if any slip through
    const cleanText = text.replace(/[*_#`[\]()]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voice = getBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
        onEndCallbackRef.current = null;
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      setIsSpeaking(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
        onEndCallbackRef.current = null;
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [muted, getBestVoice, speechRate]);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (onEndCallbackRef.current) {
      onEndCallbackRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      if (!prev && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }, []);

  return {
    isSpeaking,
    isSupported,
    muted,
    speechRate,
    setSpeechRate,
    toggleMute,
    speak,
    cancel
  };
}
