import express from "express";
import apiRoutes from "./source/routes/indexRoutes.js";
import { errorHandler } from "./source/middlewares/errorHandler.js";

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

// Middleware centralizado de errores
app.use(errorHandler);

export default app;
