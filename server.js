import "dotenv/config";
import app from "./app.js";
import { pool, testConnection } from "./source/dbConfig/db.js";

const PORT = Number(process.env.PORT || 3000);

async function start() {
  try {
    await testConnection();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ No se pudo conectar a PostgreSQL:", {
      code: error.code,
      message: error.message,
      causes: error.errors?.map((cause) => ({
        code: cause.code,
        address: cause.address,
        port: cause.port,
      })),
    });

    await pool.end();
    process.exitCode = 1;
  }
}

start();