import { authors, posts } from "./dbMock.js";

export const authorService = {
  async getAll() {
    return authors;
  },

  async getById(id) {
    return authors.find(a => a.id === parseInt(id));
  },

  async create(data) {
    const { name, email, bio } = data;
    if (!name || !name.trim() || !email || !email.trim()) {
      const err = new Error("El nombre y el email son obligatorios.");
      err.statusCode = 400;
      throw err;
    }
    const exists = authors.some(a => a.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      const err = new Error("El email ya se encuentra registrado.");
      err.statusCode = 400;
      throw err;
    }
    const newAuthor = {
      id: authors.length > 0 ? Math.max(...authors.map(a => a.id)) + 1 : 1,
      name,
      email,
      bio: bio || null,
      created_at: new Date().toISOString()
    };
    authors.push(newAuthor);
    return newAuthor;
  },

  async update(id, data) {
    const author = authors.find(a => a.id === parseInt(id));
    if (!author) return null;

    const { name, email, bio } = data;
    
    if (name !== undefined && !name.trim()) {
      const err = new Error("El nombre no puede estar vacío.");
      err.statusCode = 400;
      throw err;
    }
    if (email !== undefined && !email.trim()) {
      const err = new Error("El email no puede estar vacío.");
      err.statusCode = 400;
      throw err;
    }

    if (email && email.toLowerCase() !== author.email.toLowerCase()) {
      const exists = authors.some(a => a.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        const err = new Error("El email ya se encuentra registrado por otro autor.");
        err.statusCode = 400;
        throw err;
      }
      author.email = email;
    }
    
    if (name !== undefined) author.name = name;
    if (bio !== undefined) author.bio = bio;

    return author;
  },

  async delete(id) {
    const index = authors.findIndex(a => a.id === parseInt(id));
    if (index === -1) return false;

    const authorId = authors[index].id;
    // Borrado en cascada de los posts asociados en memoria
    for (let i = posts.length - 1; i >= 0; i--) {
      if (posts[i].author_id === authorId) {
        posts.splice(i, 1);
      }
    }

    authors.splice(index, 1);
    return true;
  }
};
