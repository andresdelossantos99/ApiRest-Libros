import { query } from "../dbConfig/db.js";

export const postService = {
  async getAll(filters = {}) {
    let sql = `
      SELECT
        p.id,
        p.title,
        p.content,
        p.published,
        p.created_at,
        p.author_id,
        a.name AS author_name,
        a.email AS author_email
      FROM posts p
      JOIN authors a ON p.author_id = a.id
    `;

    const conditions = [];
    const values = [];
    let idx = 1;

    // Filtro por author_id
    if (filters.author_id !== undefined && filters.author_id !== "") {
      const authorIdNum = Number.parseInt(filters.author_id, 10);
      if (Number.isNaN(authorIdNum)) {
        const err = new Error("El author_id debe ser un número entero.");
        err.statusCode = 400;
        throw err;
      }
      conditions.push(`p.author_id = $${idx++}`);
      values.push(authorIdNum);
    }

    // Filtro por estado published
    if (filters.published !== undefined && filters.published !== null && filters.published !== "") {
      const pubStr = String(filters.published).trim().toLowerCase();
      if (pubStr === "true" || pubStr === "1") {
        conditions.push(`p.published = $${idx++}`);
        values.push(true);
      } else if (pubStr === "false" || pubStr === "0") {
        conditions.push(`p.published = $${idx++}`);
        values.push(false);
      }
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY p.id ASC`;

    // Soporte de paginación (limit y page)
    if (filters.limit !== undefined && filters.limit !== "") {
      const limit = Math.max(1, Math.min(100, Number.parseInt(filters.limit, 10) || 10));
      const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
      const offset = (page - 1) * limit;

      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      values.push(limit, offset);
    }

    const res = await query(sql, values);
    return res.rows;
  },

  async getById(id) {
    const text = `
      SELECT
        p.id,
        p.title,
        p.content,
        p.published,
        p.created_at,
        p.author_id,
        a.name AS author_name,
        a.email AS author_email
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      WHERE p.id = $1
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  },

  async getByAuthorId(authorId) {
    const text = `
      SELECT
        p.id,
        p.title,
        p.content,
        p.published,
        p.created_at,
        p.author_id,
        a.name AS author_name,
        a.email AS author_email
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      WHERE p.author_id = $1
      ORDER BY p.id ASC
    `;
    const res = await query(text, [authorId]);
    return res.rows;
  },

  async create(data) {
    const { author_id, title, content, published } = data;
    if (author_id === undefined || !title || !title.trim() || !content || !content.trim()) {
      const err = new Error("El author_id, el título y el contenido son obligatorios.");
      err.statusCode = 400;
      throw err;
    }

    const authorRes = await query("SELECT id FROM authors WHERE id = $1", [author_id]);
    if (authorRes.rows.length === 0) {
      const err = new Error("El autor especificado no existe.");
      err.statusCode = 400;
      throw err;
    }

    try {
      const isPublished = published === undefined ? false : Boolean(published);
      const text = `
        INSERT INTO posts (author_id, title, content, published)
        VALUES ($1, $2, $3, $4)
        RETURNING id, author_id, title, content, published, created_at
      `;
      const res = await query(text, [author_id, title.trim(), content.trim(), isPublished]);
      const created = await this.getById(res.rows[0].id);
      return created || res.rows[0];
    } catch (err) {
      if (err.code === "23503") {
        const e = new Error("El autor especificado no existe.");
        e.statusCode = 400;
        throw e;
      }
      throw err;
    }
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const { author_id, title, content, published } = data;

    if (author_id !== undefined) {
      const authorRes = await query("SELECT id FROM authors WHERE id = $1", [author_id]);
      if (authorRes.rows.length === 0) {
        const err = new Error("El autor especificado no existe.");
        err.statusCode = 400;
        throw err;
      }
    }

    if (title !== undefined && !title.trim()) {
      const err = new Error("El título no puede estar vacío.");
      err.statusCode = 400;
      throw err;
    }

    if (content !== undefined && !content.trim()) {
      const err = new Error("El contenido no puede estar vacío.");
      err.statusCode = 400;
      throw err;
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (author_id !== undefined) {
      fields.push(`author_id = $${idx++}`);
      values.push(author_id);
    }
    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title.trim());
    }
    if (content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(content.trim());
    }
    if (published !== undefined) {
      fields.push(`published = $${idx++}`);
      values.push(Boolean(published));
    }

    if (fields.length === 0) {
      return existing;
    }

    values.push(id);
    const text = `
      UPDATE posts
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, author_id, title, content, published, created_at
    `;
    await query(text, values);
    return this.getById(id);
  },

  async delete(id) {
    const res = await query("DELETE FROM posts WHERE id = $1 RETURNING id", [id]);
    return res.rowCount > 0;
  }
};
