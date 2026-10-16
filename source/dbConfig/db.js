import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = pg;
const isProduction = process.env.NODE_ENV === "production";

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === "true" || isProduction
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "apilibros",
      user: process.env.DB_USER || "postgres",
      password: String(process.env.DB_PASSWORD ?? ""),
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool(poolConfig);

pool.on("error", (error) => {
  console.error("❌ Error inesperado en el pool de PostgreSQL:", error);
});

export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        current_database() AS database,
        current_user AS user,
        inet_server_addr() AS host,
        inet_server_port() AS port,
        NOW() AS server_time
    `);
    console.log("✅ PostgreSQL conectado:", result.rows[0]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

export default pool;
