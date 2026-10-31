import { aiProvider } from './ai/aiProvider.js';
import { logger } from '../utils/logger.js';

export const summarizerService = {
  /**
   * Generates a concise 3-line handoff summary for human agent takeover
   */
  async generateHandoffSummary(messages = [], reason = '') {
    const transcriptText = messages
      .slice(-6)
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const prompt = `Analyze this customer support chat transcript and generate a strict 3-line handoff summary for a human agent.
Line 1: Primary customer issue / query
Line 2: Sentiment and customer state
Line 3: Recommended immediate action for the agent

Transcript:
${transcriptText}
Escalation trigger: ${reason}

Format exactly as:
1. [Issue]
2. [State]
3. [Action]`;

    try {
      const summary = await aiProvider.generateText({
        system: 'You are an expert customer intelligence summarizer. Output exactly 3 concise numbered bullet points.',
        prompt
      });
      return summary.trim();
    } catch (err) {
      logger.error('Failed to generate LLM handoff summary', { message: err.message });
      return `1. Customer inquiry regarding hospital services.\n2. Escalation triggered due to: ${reason}.\n3. Senior agent review and callback required.`;
    }
  },

  /**
   * Generates post-conversation intelligence summary, intents, and resolution
   */
  async generateConversationSummary(messages = []) {
    if (!messages || messages.length === 0) {
      return {
        summary: 'No interaction recorded.',
        intents: [],
        resolution: 'Empty session'
      };
    }

    const transcriptText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const prompt = `Analyze this conversation transcript and return a JSON object with:
- "summary": A 2-sentence executive summary of the conversation
- "intents": Array of primary intent strings identified (e.g. ["timings", "pricing", "appointment"])
- "resolution": Brief description of how it was resolved or if pending

Transcript:
${transcriptText}`;

    try {
      const result = await aiProvider.generateJSON({
        system: 'You are an analytics summarizer. Return valid JSON only.',
        messages: [{ role: 'user', text: prompt }]
      });

      return {
        summary: result.summary || 'Customer engaged with SamvadAI voice assistant.',
        intents: Array.isArray(result.intents) ? result.intents : ['general'],
        resolution: result.resolution || 'Assisted by conversational AI.'
      };
    } catch {
      return {
        summary: 'Customer completed voice and text interaction with SamvadAI.',
        intents: ['general_inquiry'],
        resolution: 'Automated resolution completed.'
      };
    }
  }
};
