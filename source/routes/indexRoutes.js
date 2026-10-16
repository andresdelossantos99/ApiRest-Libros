import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";

import authorRoutes from "./authorRoutes.js";
import postRoutes from "./postRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openApiPath = path.resolve(__dirname, "../docs/openapi.yaml");
const openApiFile = fs.readFileSync(openApiPath, "utf8");
const swaggerDocument = yaml.parse(openApiFile);

const router = Router();

// Endpoint de estado del servicio
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando correctamente",
  });
});

// Documentación interactiva Swagger UI
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Especificación OpenAPI en formato JSON
router.get("/docs.json", (req, res) => {
  res.status(200).json(swaggerDocument);
});

// Agrupación de recursos bajo la API
router.use("/authors", authorRoutes);
router.use("/posts", postRoutes);

export default router;
