import { query } from '../config/db.js';

export const messagesRepo = {
  async create({
    conversationId,
    role,
    text,
    language = 'en',
    inputMode = 'text',
    intent = null,
    sentiment = null,
    sentimentScore = null,
    confidence = null,
    sourceIds = [],
    toolCalls = [],
    latencyMs = null
  }) {
    const res = await query(
      `INSERT INTO messages (
        conversation_id, role, text, language, input_mode,
        intent, sentiment, sentiment_score, confidence,
        source_ids, tool_calls, latency_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        conversationId,
        role,
        text,
        language,
        inputMode,
        intent,
        sentiment,
        sentimentScore,
        confidence,
        sourceIds,
        JSON.stringify(toolCalls),
        latencyMs
      ]
    );
    return res.rows[0];
  },

  async getRecentForConversation(conversationId, limit = 10) {
    const res = await query(
      `SELECT * FROM (
         SELECT * FROM messages
         WHERE conversation_id = $1
         ORDER BY created_at DESC
         LIMIT $2
       ) sub
       ORDER BY created_at ASC`,
      [conversationId, limit]
    );
    return res.rows;
  },

  async getAllForConversation(conversationId) {
    const res = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
    return res.rows;
  }
};
