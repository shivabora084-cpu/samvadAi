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
      console.error('Failed to initialize conversation:', err);
      setError('Unable to start conversation session. Please refresh.');
    }
  }, []);

  const sendMessage = useCallback(
    async (text, inputMode = 'text', onReply = null) => {
      if (!text.trim() || !conversationId) return;

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
        const { data } = await api.post(`/chat/${conversationId}/message`, {
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
        const errMsg = err.response?.data?.message || 'Failed to send message. Please retry.';
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
