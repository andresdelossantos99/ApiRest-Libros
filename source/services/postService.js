import { posts, authors } from "./dbMock.js";

export const postService = {
  async getAll() {
    return posts;
  },

  async getById(id) {
    return posts.find(p => p.id === parseInt(id));
  },

  async create(data) {
    const { author_id, title, content, published } = data;
    if (author_id === undefined || !title || !title.trim() || !content || !content.trim()) {
      const err = new Error("El author_id, el título y el contenido son obligatorios.");
      err.statusCode = 400;
      throw err;
    }

    const authorExists = authors.some(a => a.id === parseInt(author_id));
    if (!authorExists) {
      const err = new Error("El autor especificado no existe.");
      err.statusCode = 400;
      throw err;
    }

    const newPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      author_id: parseInt(author_id),
      title,
      content,
      published: published === undefined ? false : !!published,
      created_at: new Date().toISOString()
    };
    posts.push(newPost);
    return newPost;
  },

  async update(id, data) {
    const post = posts.find(p => p.id === parseInt(id));
    if (!post) return null;

    const { author_id, title, content, published } = data;

    if (author_id !== undefined) {
      const authorExists = authors.some(a => a.id === parseInt(author_id));
      if (!authorExists) {
        const err = new Error("El autor especificado no existe.");
        err.statusCode = 400;
        throw err;
      }
      post.author_id = parseInt(author_id);
    }

    if (title !== undefined) {
      if (!title.trim()) {
        const err = new Error("El título no puede estar vacío.");
        err.statusCode = 400;
        throw err;
      }
      post.title = title;
    }

    if (content !== undefined) {
      if (!content.trim()) {
        const err = new Error("El contenido no puede estar vacío.");
        err.statusCode = 400;
        throw err;
      }
      post.content = content;
    }

    if (published !== undefined) {
      post.published = !!published;
    }

    return post;
  },

  async delete(id) {
    const index = posts.findIndex(p => p.id === parseInt(id));
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
  }
};
