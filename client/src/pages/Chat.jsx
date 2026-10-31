import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import { useMediaRecorder } from '../hooks/useMediaRecorder.js';
import { useConversation } from '../hooks/useConversation.js';
import TranscriptBubble from '../components/voice/TranscriptBubble.jsx';
import MicButton from '../components/voice/MicButton.jsx';
import Waveform from '../components/voice/Waveform.jsx';
import LanguageSelector from '../components/voice/LanguageSelector.jsx';
import TypingDots from '../components/voice/TypingDots.jsx';
import Toast from '../components/Toast.jsx';
import {
  Send,
  Volume2,
  VolumeX,
  Radio,
  Power,
  Star,
  Info,
  Mic,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const existingSessionId = searchParams.get('session');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [activeSpeechText, setActiveSpeechText] = useState('');
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);
  const textInputRef = useRef(null);

  const {
    conversationId,
    messages,
    isThinking,
    isEscalated,
    escalationSummary,
    language,
    status,
    error: convError,
    setLanguage,
    initConversation,
    sendMessage,
    endCurrentConversation,
    submitRating
  } = useConversation();

  const {
    isSpeaking,
    muted,
    speechRate,
    setSpeechRate,
    toggleMute,
    speak,
    cancel: cancelSpeech
  } = useSpeechSynthesis();

  // Scroll to bottom on updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Handle incoming AI reply speech & hands-free auto-listen loop
  const handleAssistantReply = (replyText, replyLang) => {
    setActiveSpeechText(replyText);
    speak(replyText, replyLang, () => {
      setActiveSpeechText('');
      if (handsFreeMode && status !== 'resolved') {
        // In hands-free mode, start listening for next turn after speaking finishes
        setTimeout(() => {
          startListening();
        }, 300);
      }
    });
  };

  // Finalized speech input handler
  const handleFinalSpeechTranscript = (transcriptText) => {
    if (transcriptText.trim()) {
      sendMessage(transcriptText.trim(), 'voice', handleAssistantReply);
    }
  };

  // Web Speech STT Hook
  const {
    isListening,
    interimTranscript,
    isSupported: sttSupported,
    error: sttError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    language,
    onTranscriptFinal: handleFinalSpeechTranscript,
    onPermissionDenied: () => {
      setToast({
        type: 'error',
        message: 'Microphone permission denied. Switched to text input mode.'
      });
      textInputRef.current?.focus();
    }
  });

  // MediaRecorder Fallback
  const {
    isRecording: isMediaRecording,
    transcribing: isMediaTranscribing,
    startRecording: startMediaRecording,
    stopRecording: stopMediaRecording
  } = useMediaRecorder({
    onTranscriptionComplete: (text, lang) => {
      if (text) {
        sendMessage(text, 'voice', handleAssistantReply);
      }
    }
  });

  // Init conversation on mount
  useEffect(() => {
    initConversation(language, existingSessionId);
  }, [initConversation, existingSessionId]);

  // Overall voice state
  const isActivelyListening = isListening || isMediaRecording;
  const currentVoiceState = isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : isActivelyListening
    ? 'listening'
    : 'idle';

  // Mic Button Click Action
  const handleMicToggle = () => {
    if (isSpeaking) {
      // Barge-in: interrupt AI speech immediately
      cancelSpeech();
      startListening();
      return;
    }

    if (isActivelyListening) {
      stopListening();
    } else {
      if (sttSupported) {
        startListening();
      } else {
        startMediaRecording();
      }
    }
  };

  // Text message send
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const textToSend = inputText;
    setInputText('');
    sendMessage(textToSend, 'text', handleAssistantReply);
  };

  // End conversation handler
  const handleEndSession = async () => {
    cancelSpeech();
    stopListening();
    await endCurrentConversation();
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async () => {
    await submitRating(selectedRating);
    setRatingModalOpen(false);
    setToast({ type: 'success', message: 'Thank you for your feedback!' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-4.5rem)]">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Top Chat Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-3">
        <div className="flex items-center gap-2">
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={(newLang) => {
              setLanguage(newLang);
              setToast({ type: 'info', message: `Language switched to ${newLang.toUpperCase()}` });
            }}
          />

          {/* Hands-Free Mode Switch */}
          <button
            type="button"
            onClick={() => {
              setHandsFreeMode(!handsFreeMode);
              setToast({
                type: 'info',
                message: !handsFreeMode ? 'Hands-Free dialogue activated' : 'Push-To-Talk mode active'
              });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              handsFreeMode
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
            title="Toggle Hands-Free continuous conversation"
          >
            <Radio className={`w-3.5 h-3.5 ${handsFreeMode ? 'text-emerald-500 animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Hands-Free:</span>
            <span>{handsFreeMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl text-xs font-medium transition-colors ${
              muted
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
            title={muted ? 'Unmute voice replies' : 'Mute voice replies'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
          </button>

          {/* End Conversation */}
          {status !== 'resolved' && (
            <button
              type="button"
              onClick={handleEndSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900 transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Escalation Banner if triggered */}
      {isEscalated && (
        <div className="mb-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 animate-slide-up">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Human Duty Officer Handoff Active</p>
            <p className="opacity-90 mt-0.5">
              This session was escalated for priority review. A hospital duty executive has been notified with your conversation summary.
            </p>
          </div>
        </div>
      )}

      {/* Backend connection / error alert banner */}
      {convError && (
        <div className="mb-3 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 flex items-center justify-between gap-3 text-xs text-sky-900 dark:text-sky-200 animate-slide-up">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
            <span>{convError}</span>
          </div>
          <button
            type="button"
            onClick={() => initConversation(language)}
            className="px-3 py-1 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Scrollable Message Transcript Area */}
      <div
        className="flex-1 overflow-y-auto px-2 py-4 rounded-3xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm shadow-inner"
        aria-live="polite"
      >
        {messages.map((m) => (
          <TranscriptBubble
            key={m.id}
            message={m}
            onReplay={(text, lang) => speak(text, lang)}
            isSpeakingThis={isSpeaking && activeSpeechText === m.text}
          />
        ))}

        {/* Live Ghost Bubble for Interim Speech Results */}
        {interimTranscript && (
          <div className="flex justify-end mb-4 animate-pulse">
            <div className="max-w-[85%] sm:max-w-md p-3.5 rounded-2xl rounded-tr-sm bg-teal-600/40 text-white text-sm italic">
              {interimTranscript} ...
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-start mb-4">
            <TypingDots />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Composer Area */}
      <div className="mt-3 pt-2 flex flex-col items-center gap-3">
        {/* Center Mic Button & Real-time Waveform */}
        <div className="flex flex-col items-center">
          <Waveform state={currentVoiceState} barCount={7} />
          <div className="mt-2">
            <MicButton
              state={currentVoiceState}
              onClick={handleMicToggle}
              handsFree={handsFreeMode}
              disabled={status === 'resolved'}
            />
          </div>
        </div>

        {/* Text Input Fallback Bar */}
        <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2">
          <input
            ref={textInputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={status === 'resolved' || isThinking}
            placeholder={
              language === 'hi'
                ? 'यहाँ अपनी समस्या लिखें या ऊपर माइक दबाकर बोलें...'
                : language === 'ta'
                ? 'இங்கே தட்டச்சு செய்யவும் அல்லது பேச மைக் அழுத்தவும்...'
                : 'Type your message or tap the mic to speak...'
            }
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking || status === 'resolved'}
            className="p-3 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/30 disabled:opacity-40 transition-all"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Feedback Rating Modal after session ends */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rate your experience</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              How satisfied were you with SamvadAI's spoken assistance?
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRatingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleRatingSubmit}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-md shadow-teal-600/30"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
