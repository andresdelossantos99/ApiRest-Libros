import { Router } from "express";
import authorRoutes from "./authorRoutes.js";
import postRoutes from "./postRoutes.js";

const router = Router();

// Endpoint de estado del servicio
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando correctamente",
  });
});

// Agrupación de recursos bajo la API
router.use("/authors", authorRoutes);
router.use("/posts", postRoutes);

export default router;
