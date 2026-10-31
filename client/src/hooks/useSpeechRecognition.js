import { useState, useEffect, useRef, useCallback } from 'react';

const LANGUAGE_CODE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  auto: 'en-IN'
};

export function useSpeechRecognition({ onTranscriptFinal, language = 'en', onPermissionDenied }) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // single turn auto-stop on silence
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = LANGUAGE_CODE_MAP[language] || 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (final.trim()) {
        setInterimTranscript('');
        if (onTranscriptFinal) {
          onTranscriptFinal(final.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone permission denied. Please allow microphone access or use text input.');
        if (onPermissionDenied) onPermissionDenied();
      } else if (event.error === 'no-speech') {
        // Normal silence timeout
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [language, onTranscriptFinal, onPermissionDenied]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    manualStopRef.current = false;
    try {
      recognitionRef.current.lang = LANGUAGE_CODE_MAP[language] || 'en-IN';
      recognitionRef.current.start();
    } catch (err) {
      // If already started or aborting, stop and restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch {}
    }
  }, [language]);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening
  };
}
