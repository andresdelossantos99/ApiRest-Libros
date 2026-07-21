import { Router } from "express";
import { authorController } from "../controllers/authorController.js";

const router = Router();

router.get("/", authorController.getAll);
router.get("/:id", authorController.getById);
router.post("/", authorController.create);
router.put("/:id", authorController.update);
router.delete("/:id", authorController.delete);

export default router;
