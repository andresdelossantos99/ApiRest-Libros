# Plan de Tareas del Proyecto ApiRest-Libros

Lista de tareas para completar el desarrollo, migración y robustecimiento de la API REST de Libros.

---

## 📌 Estado Actual del Proyecto
- [x] Configuración inicial de Express y servidor HTTP ([server.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/server.js) y [app.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/app.js))
- [x] Tablas SQL iniciales (`authors` y `posts` con foreign key y ON DELETE CASCADE en [config/setup.sql](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/config/setup.sql))
- [x] Migración inicial de Autores a PostgreSQL ([source/services/authorService.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/services/authorService.js))
- [x] Conexión a Base de Datos unificada y carga robusta de variables `.env`
- [x] Migración del servicio de Publicaciones ([source/services/postService.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/services/postService.js)) a PostgreSQL
- [x] Filtros avanzados, paginación y sub-recursos relacionales (`/api/authors/:id/posts`)
- [x] Validaciones y manejo centralizado de errores (evitar errores 500 no capturados)
- [ ] Documentación interactiva de la API con Swagger / OpenAPI (`/api/docs`)
- [ ] Suite de pruebas automatizadas de integración (`npm test`)

---

## 🚀 Hoja de Ruta de Tareas por Fases

### Fase 1: Unificación de Conexión de Base de Datos y Entorno
- [x] **Consolidar módulo de conexión a DB**:
  - Unificar [config/dbconfig.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/config/dbconfig.js) y [source/dbConfig/db.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/dbConfig/db.js) en un único punto canónico.
  - Asegurar carga de `.env` independiente del directorio de ejecución.
  - Soportar tanto `DATABASE_URL` como variables `DB_*`.
- [x] **Actualizar importaciones en el servidor y servicios**:
  - Ajustar [server.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/server.js) y [source/services/authorService.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/services/authorService.js).

### Fase 2: Migración del Servicio de Posts a PostgreSQL
- [x] **Reescribir [source/services/postService.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/services/postService.js) con SQL real**:
  - `getAll()`: Consulta con `JOIN` a autores para devolver autor (`author_name`, `author_email`).
  - `getById(id)`: Consulta por ID incluyendo detalles del autor.
  - `create(data)`: Inserción en tabla `posts`, validación de `author_id` contra DB y retorno del registro creado.
  - `update(id, data)`: `UPDATE` dinámico de campos (`title`, `content`, `published`, `author_id`).
  - `delete(id)`: `DELETE` de la base de datos con verificación de fila eliminada.
- [x] **Ajustar [source/controllers/postController.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/controllers/postController.js)** para respuestas acordes.

### Fase 3: Filtros, Relaciones y Rutas Centralizadas
- [x] **Filtros en `GET /api/posts`**:
  - Filtrar por autor: `?author_id=...`
  - Filtrar por estado de publicación: `?published=true|false`
  - Soporte de paginación básica: `?limit=10&page=1`
- [x] **Ruta relacional anidada**:
  - `GET /api/authors/:id/posts`: Listar publicaciones de un autor específico.
- [x] **Centralización de rutas en [source/routes/indexRoutes.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/routes/indexRoutes.js)**:
  - Agrupar `/health`, `/authors`, `/posts` y montarlo bajo `/api` en [app.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/app.js).

### Fase 4: Validaciones y Manejo Centralizado de Errores
- [x] **Middleware de validación de parámetros y payloads**:
  - Validar que `:id` sea un entero positivo (evita error `22P02` de PostgreSQL).
  - Validar datos obligatorios y formato de email.
- [x] **Manejador global de errores**:
  - Mapear códigos de error de Postgres:
    - `23505` (duplicado) ➔ `400`/`409 Conflict`
    - `23503` (foreign key inexistente) ➔ `400 Bad Request`
    - `22P02` (tipo inválido) ➔ `400 Bad Request`
  - Estandarizar respuesta de error JSON: `{ "error": "mensaje descriptivo" }`.

### Fase 5: Documentación de la API (OpenAPI / Swagger)
- [ ] **Corregir y completar [source/docs/openapi.yaml](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/docs/openapi.yaml)** con la especificación completa de todos los endpoints, query params, schemas y respuestas.
- [ ] **Integrar Swagger UI**:
  - Configurar visualizador interactivo en `GET /api/docs`.

### Fase 6: Pruebas Automatizadas (Integration Tests)
- [ ] **Configurar suite de pruebas (`node --test` + `supertest`)**:
  - Tests para `/api/health`.
  - Tests CRUD para `/api/authors`.
  - Tests CRUD para `/api/posts`, filtros y cascada.
- [ ] **Configurar comando `npm test` en `package.json`**.

### Fase 7: Limpieza, Documentación Final y Cierre
- [ ] Retirar [source/services/dbMock.js](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/source/services/dbMock.js) y scripts temporales.
- [ ] Actualizar [README.md](file:///c:/Users/Andy/Desktop/apilibros/ApiRest-Libros/README.md) con los nuevos endpoints, ejemplos de filtros y comandos.
- [ ] Marcar todas las tareas en este plan como completadas.
