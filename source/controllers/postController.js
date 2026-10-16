import { postService } from "../services/postService.js";

export const postController = {
  async getAll(req, res, next) {
    try {
      const postsList = await postService.getAll(req.query);
      res.status(200).json(postsList);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const post = await postService.getById(id);
      if (!post) {
        return res.status(404).json({ error: "Publicación no encontrada." });
      }
      res.status(200).json(post);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const newPost = await postService.create(req.body);
      res.status(201).json(newPost);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedPost = await postService.update(id, req.body);
      if (!updatedPost) {
        return res.status(404).json({ error: "Publicación no encontrada." });
      }
      res.status(200).json(updatedPost);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await postService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Publicación no encontrada." });
      }
      res.status(200).json({ message: "Publicación eliminada con éxito." });
    } catch (err) {
      next(err);
    }
  }
};
