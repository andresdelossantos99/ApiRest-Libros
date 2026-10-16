import express from "express";
import apiRoutes from "./source/routes/indexRoutes.js";

const app = express();

app.use(express.json());

// Montar todas las rutas de la API bajo /api
app.use("/api", apiRoutes);

// Manejador 404 para rutas no encontradas
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
