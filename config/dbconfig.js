import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "apilibros",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query("SELECT NOW()");
    console.log("✅ Conexión a PostgreSQL exitosa");
  } finally {
    client.release();
  }
};
