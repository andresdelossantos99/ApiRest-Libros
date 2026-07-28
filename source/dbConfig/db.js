import pg from "pg";

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_NAME || "apilibros",
    };

const pool = new Pool(poolConfig);

export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS user,
      inet_server_addr() AS host,
      inet_server_port() AS port
  `);

  console.log("✅ PostgreSQL conectado:", result.rows[0]);
};

pool.on("connect", () => {
  console.log("🔌 Nueva conexión tomada del pool");
});

pool.on("error", (error) => {
  console.error("❌ Error inesperado en PostgreSQL:", error);
});

export default pool;
