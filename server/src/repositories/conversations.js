import { query } from '../config/db.js';

export const conversationsRepo = {
  async create({ userId = null, guestId = null, language = 'en' }) {
    const res = await query(
      `INSERT INTO conversations (user_id, guest_id, language, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [userId, guestId, language]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await query(
      `SELECT c.*, u.name as user_name, u.email as user_email
       FROM conversations c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async findByOwner(userId, guestId) {
    if (userId) {
      const res = await query(
        `SELECT * FROM conversations
         WHERE user_id = $1
         ORDER BY started_at DESC`,
        [userId]
      );
      return res.rows;
    }
    if (guestId) {
      const res = await query(
        `SELECT * FROM conversations
         WHERE guest_id = $1
         ORDER BY started_at DESC`,
        [guestId]
      );
      return res.rows;
    }
    return [];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, idx) => `"${key}" = $${idx + 2}`).join(', ');
    const values = [id, ...keys.map((k) => fields[k])];

    const res = await query(
      `UPDATE conversations SET ${setClauses} WHERE id = $1 RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await query('DELETE FROM conversations WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  },

  async list({ status, language, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }

    if (language) {
      params.push(language);
      conditions.push(`c.language = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.summary ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT count(*)::int as total
       FROM conversations c
       LEFT JOIN users u ON c.user_id = u.id
       ${whereClause}`,
      params
    );

    const total = countRes.rows[0].total;

    params.push(limit, offset);
    const dataRes = await query(
      `SELECT c.*, u.name as user_name, u.email as user_email,
              (SELECT count(*)::int FROM messages m WHERE m.conversation_id = c.id) as message_count
       FROM conversations c
       LEFT JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY c.started_at DESC
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
