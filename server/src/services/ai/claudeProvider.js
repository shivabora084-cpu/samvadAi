import { logger } from '../../utils/logger.js';

export const claudeProvider = {
  async generateJSON({ system, messages, schema }) {
    logger.info('Using Claude Provider (Swappable fallback abstraction)');
    throw new Error('Claude provider requires ANTHROPIC_API_KEY. Configure in .env to activate.');
  },

  async generateText({ system, prompt }) {
    logger.info('Using Claude Provider (Swappable fallback abstraction)');
    throw new Error('Claude provider requires ANTHROPIC_API_KEY. Configure in .env to activate.');
  },

  async transcribeAudio(buffer, mime, langHint) {
    throw new Error('Audio transcription directly not supported in Claude. Use Gemini multimodal.');
  }
};
