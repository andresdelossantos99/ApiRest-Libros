import pg from "pg";

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

// Usamos DATABASE_URL si está disponible (típico en producción/Railway),
// de lo contrario, recurrimos a variables individuales para desarrollo local.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    }
  : {
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_DATABASE || "api_libros"
    };

const pool = new Pool(poolConfig);

// Mensajes de log para verificar la conexión
pool.on("connect", () => {
  console.log("🔌 Conexión establecida con la base de datos PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en el cliente del Pool de PostgreSQL:", err);
});

// Helper para realizar consultas preparadas
export const query = (text, params) => pool.query(text, params);

export default pool;
