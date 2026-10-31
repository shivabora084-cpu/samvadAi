import { query } from '../config/db.js';

export const knowledgeRepo = {
  async searchFullText(searchString, limit = 4) {
    if (!searchString || !searchString.trim()) return [];

    try {
      const res = await query(
        `SELECT id, title, content, category, tags, language,
                ts_rank(search_vector, websearch_to_tsquery('simple', $1)) as rank
         FROM knowledge_entries
         WHERE active = true AND search_vector @@ websearch_to_tsquery('simple', $1)
         ORDER BY rank DESC
         LIMIT $2`,
        [searchString.trim(), limit]
      );
      return res.rows;
    } catch {
      // If websearch_to_tsquery encounters unparseable characters, fallback to plainto_tsquery
      try {
        const res = await query(
          `SELECT id, title, content, category, tags, language,
                  ts_rank(search_vector, plainto_tsquery('simple', $1)) as rank
           FROM knowledge_entries
           WHERE active = true AND search_vector @@ plainto_tsquery('simple', $1)
           ORDER BY rank DESC
           LIMIT $2`,
          [searchString.trim(), limit]
        );
        return res.rows;
      } catch {
        return [];
      }
    }
  },

  async searchTrigram(searchString, limit = 4) {
    if (!searchString || !searchString.trim()) return [];

    try {
      const res = await query(
        `SELECT id, title, content, category, tags, language,
                GREATEST(similarity(title, $1), similarity(content, $1)) as sim
         FROM knowledge_entries
         WHERE active = true AND (similarity(title, $1) > 0.15 OR similarity(content, $1) > 0.15)
         ORDER BY sim DESC
         LIMIT $2`,
        [searchString.trim(), limit]
      );
      return res.rows;
    } catch {
      // If pg_trgm extension isn't available or fails, fallback to ILIKE
      const terms = searchString.trim().split(/\s+/).slice(0, 3);
      const ilikeConditions = terms.map((_, i) => `(title ILIKE $${i + 1} OR content ILIKE $${i + 1})`).join(' OR ');
      const params = terms.map(t => `%${t}%`);
      params.push(limit);

      const res = await query(
        `SELECT id, title, content, category, tags, language, 0.5 as sim
         FROM knowledge_entries
         WHERE active = true AND (${ilikeConditions})
         LIMIT $${params.length}`,
        params
      );
      return res.rows;
    }
  },

  async findById(id) {
    const res = await query('SELECT * FROM knowledge_entries WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const res = await query('SELECT id, title, category, language FROM knowledge_entries WHERE id = ANY($1::uuid[])', [ids]);
    return res.rows;
  },

  async create({ title, content, category = 'general', tags = [], language = 'en', active = true }) {
    const res = await query(
      `INSERT INTO knowledge_entries (title, content, category, tags, language, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, content, category, tags, language, active]
    );
    return res.rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, idx) => `"${key}" = $${idx + 2}`).join(', ');
    const values = [id, ...keys.map((k) => fields[k])];

    const res = await query(
      `UPDATE knowledge_entries SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async delete(id) {
    const res = await query('DELETE FROM knowledge_entries WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  },

  async list({ category, language, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (language) {
      params.push(language);
      conditions.push(`language = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT count(*)::int as total FROM knowledge_entries ${whereClause}`, params);
    const total = countRes.rows[0].total;

    params.push(limit, offset);
    const dataRes = await query(
      `SELECT * FROM knowledge_entries
       ${whereClause}
       ORDER BY created_at DESC
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
