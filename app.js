import express from "express";
import authorRoutes from "./source/routes/authorRoutes.js";
import postRoutes from "./source/routes/postRoutes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando correctamente",
  });
});
// Montar rutas
app.use("/api/authors", authorRoutes);
app.use("/api/posts", postRoutes);
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// Middleware básico para manejo global de errores (se potenciará en la Fase 4)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Error interno del servidor.",
  });
});

export default app;
