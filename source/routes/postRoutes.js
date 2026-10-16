import { Router } from "express";
import { postController } from "../controllers/postController.js";
import {
  validateId,
  validateCreatePost,
  validateUpdatePost,
} from "../middlewares/validators.js";

const router = Router();

router.get("/", postController.getAll);
router.get("/:id", validateId("id"), postController.getById);
router.post("/", validateCreatePost, postController.create);
router.put("/:id", validateId("id"), validateUpdatePost, postController.update);
router.delete("/:id", validateId("id"), postController.delete);

export default router;
