import { authorService } from "../services/authorService.js";

export const authorController = {
  async getAll(req, res, next) {
    try {
      const authorsList = await authorService.getAll();
      res.status(200).json(authorsList);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const author = await authorService.getById(id);
      if (!author) {
        return res.status(404).json({ error: "Autor no encontrado." });
      }
      res.status(200).json(author);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const newAuthor = await authorService.create(req.body);
      res.status(201).json(newAuthor);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedAuthor = await authorService.update(id, req.body);
      if (!updatedAuthor) {
        return res.status(404).json({ error: "Autor no encontrado." });
      }
      res.status(200).json(updatedAuthor);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await authorService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Autor no encontrado." });
      }
      res.status(200).json({ message: "Autor eliminado con éxito (y sus publicaciones asociadas)." });
    } catch (err) {
      next(err);
    }
  }
};
