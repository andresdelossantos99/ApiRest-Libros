import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./source/dbConfig/db.js";

const PORT = process.env.PORT || 3000;

testConnection().catch((err) => {
  console.error("❌ No se pudo conectar a PostgreSQL:", err.message);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
