import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { geminiProvider } from './geminiProvider.js';
import { claudeProvider } from './claudeProvider.js';
import { openaiProvider } from './openaiProvider.js';

const getActiveProvider = () => {
  switch (env.AI_PROVIDER) {
    case 'claude':
      return claudeProvider;
    case 'openai':
      return openaiProvider;
    case 'gemini':
    default:
      return geminiProvider;
  }
};

/**
 * Execute with 20s timeout and 1 retry with exponential backoff
 */
async function withTimeoutAndRetry(fn, timeoutMs = 20000, retries = 1) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Provider request timed out after 20s')), timeoutMs)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch (err) {
      attempt++;
      logger.warn(`AI provider operation failed (attempt ${attempt}/${retries + 1}): ${err.message}`);
      if (attempt > retries) {
        throw err;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

export const aiProvider = {
  async generateJSON({ system, messages, schema }) {
    const provider = getActiveProvider();
    try {
      return await withTimeoutAndRetry(() => provider.generateJSON({ system, messages, schema }));
    } catch (err) {
      logger.error('Failed to generate JSON from primary AI provider, executing fallback logic', { message: err.message });
      // Graceful fallback response
      const lastMsg = [...messages].reverse().find((m) => m.role === 'user');
      const text = lastMsg ? lastMsg.text : '';
      const isTamil = /[\u0B80-\u0BFF]/.test(text);
      const isHindi = /[\u0900-\u097F]/.test(text);
      const lang = isTamil ? 'ta' : isHindi ? 'hi' : 'en';

      return {
        detectedLanguage: lang,
        reply: lang === 'ta'
          ? 'மன்னிக்கவும், தகவல் சேவையில் தற்காலிக தாமதம் ஏற்பட்டுள்ளது. அவசர உதவிக்கு 044-24567890 அழைக்கவும்.'
          : lang === 'hi'
          ? 'क्षमा करें, सेवा में अस्थायी रुकावट है। आपातकालीन सहायता के लिए 044-24567890 पर संपर्क करें।'
          : 'I apologize, but our information service is temporarily unavailable. For immediate assistance, please call our 24/7 help desk at 044-24567890.',
        intent: 'unknown',
        sentiment: 'neutral',
        sentimentScore: 0.0,
        confidence: 0.2,
        usedSourceIds: [],
        action: { type: 'none', params: {} },
        needsMoreInfo: [],
        searchQuery: text.slice(0, 30)
      };
    }
  },

  async generateText(options) {
    const provider = getActiveProvider();
    try {
      return await withTimeoutAndRetry(() => provider.generateText(options));
    } catch (err) {
      logger.error('Failed to generate text from AI provider', { message: err.message });
      return 'Summary unavailable due to temporary AI service timeout.';
    }
  },

  async transcribeAudio(buffer, mime, langHint) {
    const provider = getActiveProvider();
    try {
      return await withTimeoutAndRetry(() => provider.transcribeAudio(buffer, mime, langHint));
    } catch (err) {
      logger.error('Audio transcription failed', { message: err.message });
      throw err;
    }
  }
};
