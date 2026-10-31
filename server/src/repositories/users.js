import { query } from '../config/db.js';

export const usersRepo = {
  async findByEmail(email) {
    const res = await query(
      'SELECT id, name, email, password_hash, role, preferred_language, created_at FROM users WHERE lower(email) = lower($1)',
      [email]
    );
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query(
      'SELECT id, name, email, role, preferred_language, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  },

  async create({ name, email, passwordHash, role = 'customer', preferredLanguage = 'en' }) {
    const res = await query(
      `INSERT INTO users (name, email, password_hash, role, preferred_language)
       VALUES ($1, lower($2), $3, $4, $5)
       RETURNING id, name, email, role, preferred_language, created_at`,
      [name, email, passwordHash, role, preferredLanguage]
    );
    return res.rows[0];
  },

  async count() {
    const res = await query('SELECT count(*)::int as count FROM users');
    return res.rows[0].count;
  }
};
