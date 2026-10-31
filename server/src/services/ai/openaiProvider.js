import { logger } from '../../utils/logger.js';

export const openaiProvider = {
  async generateJSON({ system, messages, schema }) {
    logger.info('Using OpenAI Provider (Swappable fallback abstraction)');
    throw new Error('OpenAI provider requires OPENAI_API_KEY. Configure in .env to activate.');
  },

  async generateText({ system, prompt }) {
    logger.info('Using OpenAI Provider (Swappable fallback abstraction)');
    throw new Error('OpenAI provider requires OPENAI_API_KEY. Configure in .env to activate.');
  },

  async transcribeAudio(buffer, mime, langHint) {
    throw new Error('Whisper requires OPENAI_API_KEY. Configure in .env to activate.');
  }
};
