/**
 * Middleware global y centralizado para el manejo de errores.
 * Captura excepciones, mapea códigos de error de PostgreSQL y estandariza respuestas JSON.
 */
export const errorHandler = (err, req, res, next) => {
  // Manejo de errores de sintaxis JSON en el cuerpo de la solicitud
  if (err instanceof SyntaxError && "body" in err && err.status === 400) {
    return res.status(400).json({
      error: "Formato JSON inválido en el cuerpo de la solicitud.",
    });
  }

  // Mapeo específico de códigos de error de PostgreSQL
  if (err && err.code) {
    switch (err.code) {
      case "23505": {
        // unique_violation
        return res.status(409).json({
          error: "Ya existe un registro con esos datos únicos.",
          detail: err.detail || undefined,
        });
      }

      case "23503": {
        // foreign_key_violation
        return res.status(400).json({
          error:
            "El registro relacionado especificado no existe o no se puede eliminar por tener dependencias.",
          detail: err.detail || undefined,
        });
      }

      case "23502": {
        // not_null_violation
        return res.status(400).json({
          error: `El campo '${err.column || "requerido"}' no puede ser nulo.`,
        });
      }

      case "22P02": {
        // invalid_text_representation
        return res.status(400).json({
          error: "Sintaxis de entrada inválida para el tipo de dato esperado por la base de datos.",
        });
      }

      default:
        break;
    }
  }

  // Código de estado HTTP explícito o predeterminado 500
  const statusCode =
    err.statusCode || (typeof err.status === "number" ? err.status : 500);

  // Registro en consola de errores 500 para diagnóstico (omitido en test si se desea)
  if (statusCode >= 500 && process.env.NODE_ENV !== "test") {
    console.error("❌ Error interno del servidor no controlado:", err);
  }

  res.status(statusCode).json({
    error: err.message || "Error interno del servidor.",
  });
};
