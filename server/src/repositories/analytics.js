import { query } from '../config/db.js';

export const analyticsRepo = {
  async getOverview() {
    const convStats = await query(`
      SELECT
        COUNT(*)::int as total_conversations,
        COUNT(*) FILTER (WHERE status = 'resolved')::int as resolved_conversations,
        COUNT(*) FILTER (WHERE escalated = true)::int as escalated_conversations,
        COALESCE(AVG(sentiment_avg), 0)::numeric(3,2) as avg_sentiment
      FROM conversations
    `);

    const msgStats = await query(`
      SELECT
        COUNT(*)::int as total_messages,
        COALESCE(AVG(latency_ms) FILTER (WHERE role = 'assistant'), 0)::int as avg_latency_ms
      FROM messages
    `);

    const ticketStats = await query(`
      SELECT
        COUNT(*)::int as total_tickets,
        COUNT(*) FILTER (WHERE status = 'open')::int as open_tickets
      FROM tickets
    `);

    const apptStats = await query(`
      SELECT
        COUNT(*)::int as total_appointments,
        COUNT(*) FILTER (WHERE status = 'booked')::int as booked_appointments
      FROM appointments
    `);

    const totalConv = convStats.rows[0].total_conversations;
    const resolvedConv = convStats.rows[0].resolved_conversations;
    const escalatedConv = convStats.rows[0].escalated_conversations;

    const resolutionRate = totalConv > 0 ? Number(((resolvedConv / totalConv) * 100).toFixed(1)) : 0;
    const escalationRate = totalConv > 0 ? Number(((escalatedConv / totalConv) * 100).toFixed(1)) : 0;

    return {
      totalConversations: totalConv,
      totalMessages: msgStats.rows[0].total_messages,
      totalTickets: ticketStats.rows[0].total_tickets,
      openTickets: ticketStats.rows[0].open_tickets,
      totalAppointments: apptStats.rows[0].total_appointments,
      bookedAppointments: apptStats.rows[0].booked_appointments,
      resolutionRate,
      escalationRate,
      avgSentiment: Number(convStats.rows[0].avg_sentiment),
      avgLatencyMs: msgStats.rows[0].avg_latency_ms
    };
  },

  async getTimeseries() {
    const res = await query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '13 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS day
      )
      SELECT
        to_char(d.day, 'YYYY-MM-DD') as date,
        to_char(d.day, 'Mon DD') as formatted_date,
        COUNT(c.id)::int as total,
        COUNT(c.id) FILTER (WHERE c.status = 'resolved')::int as resolved,
        COUNT(c.id) FILTER (WHERE c.escalated = true)::int as escalated
      FROM dates d
      LEFT JOIN conversations c ON c.started_at::date = d.day
      GROUP BY d.day
      ORDER BY d.day ASC
    `);
    return res.rows;
  },

  async getLanguageDistribution() {
    const res = await query(`
      SELECT
        language,
        COUNT(*)::int as count
      FROM conversations
      GROUP BY language
      ORDER BY count DESC
    `);
    return res.rows;
  },

  async getIntentDistribution() {
    const res = await query(`
      SELECT
        unnest(intents) as intent,
        COUNT(*)::int as count
      FROM conversations
      WHERE intents IS NOT NULL AND cardinality(intents) > 0
      GROUP BY intent
      ORDER BY count DESC
      LIMIT 8
    `);
    return res.rows;
  },

  async getSentimentDistribution() {
    const res = await query(`
      SELECT
        COALESCE(sentiment, 'neutral') as sentiment,
        COUNT(*)::int as count
      FROM messages
      WHERE role = 'assistant'
      GROUP BY sentiment
      ORDER BY count DESC
    `);
    return res.rows;
  },

  async getTopUnanswered() {
    const res = await query(`
      SELECT
        m.text as question,
        m.language,
        m.confidence,
        m.created_at,
        c.id as conversation_id
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.role = 'user'
        AND EXISTS (
          SELECT 1 FROM messages resp
          WHERE resp.conversation_id = m.conversation_id
            AND resp.role = 'assistant'
            AND resp.created_at > m.created_at
            AND (resp.confidence < 0.5 OR resp.intent = 'unknown')
        )
      ORDER BY m.created_at DESC
      LIMIT 10
    `);
    return res.rows;
  }
};
