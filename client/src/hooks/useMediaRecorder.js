import { useState, useRef, useCallback } from 'react';
import api from '../api/axios.js';

export function useMediaRecorder({ onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recorderError, setRecorderError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    setRecorderError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop stream tracks to release microphone hardware
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size > 0) {
          try {
            setTranscribing(true);
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const { data } = await api.post('/voice/transcribe', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success && onTranscriptionComplete) {
              onTranscriptionComplete(data.text, data.language);
            }
          } catch (err) {
            console.error('Audio transcription fallback failed:', err);
            setRecorderError('Audio transcription failed. Please try speaking again.');
          } finally {
            setTranscribing(false);
          }
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to get media devices:', err);
      setRecorderError('Microphone access denied or unavailable.');
      setIsRecording(false);
    }
  }, [onTranscriptionComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    transcribing,
    recorderError,
    startRecording,
    stopRecording
  };
}
