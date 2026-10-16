import { Router } from "express";
import { authorController } from "../controllers/authorController.js";
import {
  validateId,
  validateCreateAuthor,
  validateUpdateAuthor,
} from "../middlewares/validators.js";

const router = Router();

router.get("/", authorController.getAll);
router.get("/:id", validateId("id"), authorController.getById);
router.get("/:id/posts", validateId("id"), authorController.getPosts);
router.post("/", validateCreateAuthor, authorController.create);
router.put("/:id", validateId("id"), validateUpdateAuthor, authorController.update);
router.delete("/:id", validateId("id"), authorController.delete);

export default router;
