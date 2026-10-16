import { pool } from "../source/dbConfig/db.js";

let client;

try {
    client = await pool.connect();

    await client.query("BEGIN");

    await client.query(`
    CREATE TABLE IF NOT EXISTS authors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      bio TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL
        REFERENCES authors(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_posts_author_id
      ON posts(author_id);
  `);

    await client.query("COMMIT");

    console.log("✅ Tablas de PostgreSQL preparadas.");
} catch (error) {
    if (client) {
        await client.query("ROLLBACK").catch(() => { });
    }

    console.error("❌ No se pudo inicializar la base:", {
        code: error.code,
        message: error.message,
    });

    process.exitCode = 1;
} finally {
    client?.release();
    await pool.end();
}