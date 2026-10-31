import { useState, useCallback, useRef } from 'react';
import api from '../api/axios.js';

export function useConversation() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [escalationSummary, setEscalationSummary] = useState(null);
  const [language, setLanguage] = useState('en');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState(null);

  const initConversation = useCallback(async (initialLang = 'en', existingSessionId = null) => {
    setError(null);
    try {
      if (existingSessionId) {
        // Load existing session
        const { data } = await api.get(`/chat/${existingSessionId}`);
        if (data.success) {
          setConversationId(data.conversation.id);
          setLanguage(data.conversation.language || initialLang);
          setStatus(data.conversation.status);
          setIsEscalated(data.conversation.escalated || false);
          setEscalationSummary(data.conversation.escalation_summary || null);
          setMessages(data.messages || []);
          return data.conversation;
        }
      }

      // Start new conversation
      const { data } = await api.post('/chat/start', { language: initialLang });
      if (data.success) {
        setConversationId(data.conversationId);
        setLanguage(data.language);
        setStatus('active');
        setIsEscalated(false);
        setEscalationSummary(null);

        // Initial greeting bubble
        setMessages([
          {
            id: 'init-greeting',
            role: 'assistant',
            text: data.greeting,
            language: data.language,
            intent: 'greeting',
            sentiment: 'positive',
            created_at: new Date().toISOString()
          }
        ]);
        return data;
      }
    } catch (err) {
      console.warn('Backend server waking up or unreachable, using offline greeting:', err);
      // Fallback greeting if Render backend is waking up or network is delayed
      const fallbackGreetings = {
        en: 'Hello! I am SamvadAI. How can I assist you with hospital OPD timings, doctor appointments, or support today?',
        hi: 'नमस्ते! मैं संवादAI हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ? आप ओपीडी समय, डॉक्टरों, टेस्ट रिपोर्ट या अपॉइंटमेंट के बारे में पूछ सकते हैं।',
        ta: 'வணக்கம்! நான் சம்வாத்AI. இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்? ஓபிடி நேரம், மருத்துவர்கள், பரிசோதனை முடிவுகள் அல்லது முன்பதிவு பற்றி நீங்கள் கேட்கலாம்.'
      };

      const fallbackId = `conv_pending_${Date.now()}`;
      setConversationId(fallbackId);
      setLanguage(initialLang);
      setStatus('active');
      setMessages([
        {
          id: 'init-greeting',
          role: 'assistant',
          text: fallbackGreetings[initialLang] || fallbackGreetings.en,
          language: initialLang,
          intent: 'greeting',
          sentiment: 'positive',
          created_at: new Date().toISOString()
        }
      ]);
    }
  }, []);

  const sendMessage = useCallback(
    async (text, inputMode = 'text', onReply = null) => {
      if (!text.trim()) return;

      const optimisticMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        input_mode: inputMode,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setIsThinking(true);
      setError(null);

      try {
        let activeConvId = conversationId;

        // If conversation was in pending/offline state, initialize on the server now
        if (!activeConvId || activeConvId.startsWith('conv_pending_')) {
          const { data: startData } = await api.post('/chat/start', { language });
          if (startData.success && startData.conversationId) {
            activeConvId = startData.conversationId;
            setConversationId(activeConvId);
          }
        }

        const { data } = await api.post(`/chat/${activeConvId}/message`, {
          text: text.trim(),
          inputMode,
          languageHint: language
        });

        if (data.success) {
          const assistantMsg = {
            id: data.messageId || `asst-${Date.now()}`,
            role: 'assistant',
            text: data.reply,
            language: data.language || language,
            intent: data.intent,
            sentiment: data.sentiment,
            sentiment_score: data.sentimentScore,
            confidence: data.confidence,
            sources: data.sources || [],
            tool_calls: data.action ? [data.action] : [],
            latency_ms: data.latencyMs,
            created_at: new Date().toISOString()
          };

          setMessages((prev) => [...prev, assistantMsg]);

          if (data.language) {
            setLanguage(data.language);
          }

          if (data.escalated) {
            setIsEscalated(true);
            setEscalationSummary(data.escalationSummary);
            setStatus('escalated');
          }

          if (onReply) {
            onReply(data.reply, data.language || language);
          }
        }
      } catch (err) {
        console.error('Error sending message:', err);
        const errMsg = err.response?.data?.message || 'Connecting to server (Render service may take ~30s on cold start). Please retry in a moment.';
        setError(errMsg);
      } finally {
        setIsThinking(false);
      }
    },
    [conversationId, language]
  );

  const endCurrentConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      const { data } = await api.post(`/chat/${conversationId}/end`);
      if (data.success) {
        setStatus('resolved');
        return data.conversation;
      }
    } catch (err) {
      console.error('Failed to end conversation:', err);
    }
  }, [conversationId]);

  const submitRating = useCallback(
    async (rating) => {
      if (!conversationId) return;
      try {
        await api.post(`/chat/${conversationId}/rating`, { rating });
      } catch (err) {
        console.error('Failed to submit rating:', err);
      }
    },
    [conversationId]
  );

  return {
    conversationId,
    messages,
    isThinking,
    isEscalated,
    escalationSummary,
    language,
    status,
    error,
    setLanguage,
    initConversation,
    sendMessage,
    endCurrentConversation,
    submitRating
  };
}
