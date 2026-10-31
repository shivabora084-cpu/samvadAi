import { query } from '../config/db.js';

export const appointmentsRepo = {
  async create({ userId = null, guestId = null, conversationId = null, name, phone, department, scheduledAt }) {
    const res = await query(
      `INSERT INTO appointments (user_id, guest_id, conversation_id, name, phone, department, scheduled_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'booked')
       RETURNING *`,
      [userId, guestId, conversationId, name, phone, department, scheduledAt]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async cancel(id) {
    const res = await query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [id]
    );
    return res.rows[0] || null;
  },

  async list({ status, department, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    if (department) {
      params.push(department);
      conditions.push(`a.department ILIKE $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(a.name ILIKE $${params.length} OR a.phone ILIKE $${params.length} OR a.department ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*)::int as total FROM appointments a ${whereClause}`, params);
    const total = countRes.rows[0].total;

    params.push(limit, offset);
    const dataRes = await query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.scheduled_at ASC
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
