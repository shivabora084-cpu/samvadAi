import { query } from '../config/db.js';

export const ticketsRepo = {
  async create({ userId = null, guestId = null, conversationId = null, subject, description, category = 'general', priority = 'medium' }) {
    const res = await query(
      `INSERT INTO tickets (user_id, guest_id, conversation_id, subject, description, category, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, guestId, conversationId, subject, description, category, priority]
    );
    return res.rows[0];
  },

  async findByCode(ticketCode) {
    const res = await query(
      `SELECT t.*, u.name as user_name, u.email as user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.ticket_code = $1`,
      [ticketCode.trim().toUpperCase()]
    );
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query('SELECT * FROM tickets WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async updateStatus(id, status) {
    const res = await query(
      'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return res.rows[0] || null;
  },

  async list({ status, category, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`t.category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(t.ticket_code ILIKE $${params.length} OR t.subject ILIKE $${params.length} OR t.description ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*)::int as total FROM tickets t ${whereClause}`, params);
    const total = countRes.rows[0].total;

    params.push(limit, offset);
    const dataRes = await query(
      `SELECT t.*, u.name as user_name, u.email as user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      data: dataRes.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
