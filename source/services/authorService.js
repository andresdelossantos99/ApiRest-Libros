import { query } from "../../config/dbconfig.js";

export const authorService = {
  async getAll() {
    const res = await query('SELECT id, name, email, bio, created_at FROM authors ORDER BY id');
    return res.rows;
  },

  async getById(id) {
    const res = await query('SELECT id, name, email, bio, created_at FROM authors WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async create(data) {
    const { name, email, bio } = data;
    if (!name || !name.trim() || !email || !email.trim()) {
      const err = new Error("El nombre y el email son obligatorios.");
      err.statusCode = 400;
      throw err;
    }

    try {
      const res = await query(
        'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING id, name, email, bio, created_at',
        [name, email, bio || null]
      );
      return res.rows[0];
    } catch (err) {
      // Postgres unique violation
      if (err && err.code === '23505') {
        const e = new Error('El email ya se encuentra registrado.');
        e.statusCode = 400;
        throw e;
      }
      throw err;
    }
  },

  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const { name, email, bio } = data;

    if (name !== undefined && !name.trim()) {
      const err = new Error('El nombre no puede estar vacío.');
      err.statusCode = 400;
      throw err;
    }
    if (email !== undefined && !email.trim()) {
      const err = new Error('El email no puede estar vacío.');
      err.statusCode = 400;
      throw err;
    }

    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const check = await query('SELECT 1 FROM authors WHERE lower(email) = lower($1) AND id <> $2', [email, id]);
      if (check.rowCount > 0) {
        const err = new Error('El email ya se encuentra registrado por otro autor.');
        err.statusCode = 400;
        throw err;
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(bio);
    }

    if (fields.length === 0) {
      // nothing to update
      return existing;
    }

    values.push(id); // for WHERE
    const q = `UPDATE authors SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, bio, created_at`;
    const res = await query(q, values);
    return res.rows[0];
  },

  async delete(id) {
    const res = await query('DELETE FROM authors WHERE id = $1 RETURNING id', [id]);
    return res.rowCount > 0;
  }
};
