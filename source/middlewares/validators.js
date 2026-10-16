/**
 * Middleware para validar que el parámetro (por defecto :id) sea un número entero positivo.
 * Previene el error 22P02 de PostgreSQL antes de consultar la base de datos.
 */
export const validateId = (paramName = "id") => {
  return (req, res, next) => {
    const rawVal = req.params[paramName];
    const num = Number(rawVal);

    if (!rawVal || !Number.isInteger(num) || num <= 0) {
      return res.status(400).json({
        error: `El parámetro ${paramName} debe ser un número entero positivo.`,
      });
    }

    req.params[paramName] = num;
    next();
  };
};

/**
 * Validador de formato de correo electrónico.
 */
export const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * Valida el cuerpo de la petición al crear un Autor (POST /api/authors).
 */
export const validateCreateAuthor = (req, res, next) => {
  const { name, email, bio } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      error: "El nombre es obligatorio y no puede estar vacío.",
    });
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      error: "El email es obligatorio y no puede estar vacío.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "El formato del email no es válido.",
    });
  }

  if (bio !== undefined && bio !== null && typeof bio !== "string") {
    return res.status(400).json({
      error: "La biografía debe ser una cadena de texto.",
    });
  }

  next();
};

/**
 * Valida el cuerpo de la petición al actualizar un Autor (PUT /api/authors/:id).
 */
export const validateUpdateAuthor = (req, res, next) => {
  const { name, email, bio } = req.body || {};

  if (name === undefined && email === undefined && bio === undefined) {
    return res.status(400).json({
      error: "Debe proporcionar al menos un campo para actualizar (name, email o bio).",
    });
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "El nombre no puede estar vacío.",
      });
    }
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        error: "El email no puede estar vacío.",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "El formato del email no es válido.",
      });
    }
  }

  if (bio !== undefined && bio !== null && typeof bio !== "string") {
    return res.status(400).json({
      error: "La biografía debe ser una cadena de texto.",
    });
  }

  next();
};

/**
 * Valida el cuerpo de la petición al crear una Publicación (POST /api/posts).
 */
export const validateCreatePost = (req, res, next) => {
  const { author_id, title, content, published } = req.body || {};

  if (author_id === undefined || author_id === null) {
    return res.status(400).json({
      error: "El author_id es obligatorio.",
    });
  }

  const authorIdNum = Number(author_id);
  if (!Number.isInteger(authorIdNum) || authorIdNum <= 0) {
    return res.status(400).json({
      error: "El author_id debe ser un número entero positivo.",
    });
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "El título es obligatorio y no puede estar vacío.",
    });
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({
      error: "El contenido es obligatorio y no puede estar vacío.",
    });
  }

  if (published !== undefined && typeof published !== "boolean") {
    return res.status(400).json({
      error: "El campo published debe ser un valor booleano (true o false).",
    });
  }

  next();
};

/**
 * Valida el cuerpo de la petición al actualizar una Publicación (PUT /api/posts/:id).
 */
export const validateUpdatePost = (req, res, next) => {
  const { author_id, title, content, published } = req.body || {};

  if (
    author_id === undefined &&
    title === undefined &&
    content === undefined &&
    published === undefined
  ) {
    return res.status(400).json({
      error:
        "Debe proporcionar al menos un campo para actualizar (author_id, title, content o published).",
    });
  }

  if (author_id !== undefined) {
    const authorIdNum = Number(author_id);
    if (!Number.isInteger(authorIdNum) || authorIdNum <= 0) {
      return res.status(400).json({
        error: "El author_id debe ser un número entero positivo.",
      });
    }
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "El título no puede estar vacío.",
      });
    }
  }

  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        error: "El contenido no puede estar vacío.",
      });
    }
  }

  if (published !== undefined && typeof published !== "boolean") {
    return res.status(400).json({
      error: "El campo published debe ser un valor booleano (true o false).",
    });
  }

  next();
};
