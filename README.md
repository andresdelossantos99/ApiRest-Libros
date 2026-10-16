# 📚 ApiRest-Libros

API RESTful completa para la gestión de autores y publicaciones de blog, construida con **Node.js**, **Express** y **PostgreSQL**.

---

## 🚀 Características Principales

* **Persistencia Relacional Completa en PostgreSQL**:
  * Autores (`authors`) y Publicaciones (`posts`).
  * Integridad referencial con clave foránea y eliminación en cascada (`ON DELETE CASCADE`).
* **Conexión Robusta a Base de Datos**:
  * Pool de conexiones unificado con soporte para `DATABASE_URL` y variables individuales `DB_*`.
  * Carga confiable e independiente de variables de entorno `.env`.
* **Filtros Avanzados y Paginación**:
  * Filtrado dinámico de publicaciones por autor (`?author_id=...`) y estado (`?published=true|false`).
  * Paginación controlada (`?limit=10&page=1`).
* **Sub-recursos Relacionales**:
  * Consulta anidada de posts por autor (`GET /api/authors/:id/posts`).
* **Validaciones y Manejo Centralizado de Errores**:
  * Middleware de validación para parámetros de ruta (`/:id` entero positivo) y cuerpos de petición (DTOs).
  * Mapeo automático de códigos de error de PostgreSQL (`23505` duplicado ➔ `409 Conflict`, `23503` clave foránea ➔ `400 Bad Request`).
  * Respuestas de error estandarizadas en formato JSON `{ "error": "..." }`.
* **Documentación Interactiva con Swagger UI**:
  * Especificación OpenAPI 3.0 visualizable en `GET /api/docs`.
  * Especificación JSON disponible en `GET /api/docs.json`.
* **Suite de Pruebas Automatizadas de Integración**:
  * 30 tests automatizados con `node:test` y `supertest` ejecutables mediante `npm test`.

---

## 🛠️ Tecnologías

* **Runtime**: Node.js (v20+ / ES Modules)
* **Framework Web**: Express 5
* **Base de Datos**: PostgreSQL (`pg` / Pool)
* **Documentación**: Swagger UI Express & OpenAPI 3.0 (`yaml`)
* **Testing**: Node Test Runner nativo (`node --test`) + Supertest
* **Herramientas**: Dotenv, Dotenv-CLI, Nodemon

---

## ⚙️ Configuración del Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apilibros
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_SSL=false
```

> **Nota**: También puedes utilizar una cadena única de conexión mediante la variable `DATABASE_URL=postgres://usuario:password@host:5432/apilibros`.

---

## 📦 Instalación y Comandos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Inicializar la base de datos (PostgreSQL)
```bash
# Crear las tablas (authors y posts)
npm run db:setup

# Insertar datos de prueba
npm run db:seed

# Reinicio completo (setup + seed)
npm run db:reset
```

### 3. Iniciar el servidor
```bash
# Modo desarrollo con recarga automática
npm run dev

# Modo producción
npm start
```

### 4. Ejecutar la suite de pruebas
```bash
npm test
```

---

## 📖 Documentación Interactiva (Swagger UI)

Una vez iniciado el servidor, accede a la documentación interactiva desde tu navegador:

* **Swagger UI interactivo**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
* **Especificación OpenAPI (JSON)**: [http://localhost:3000/api/docs.json](http://localhost:3000/api/docs.json)

---

## 🔌 Endpoints de la API

Todas las rutas están centralizadas bajo el prefijo `/api`:

### 🩺 Estado del Servicio
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifica la salud y disponibilidad de la API |

### ✍️ Autores (`/api/authors`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/authors` | Lista todos los autores registrados |
| `GET` | `/api/authors/:id` | Obtiene los detalles de un autor por su ID |
| `POST` | `/api/authors` | Crea un nuevo autor (`name`, `email`, `bio`) |
| `PUT` | `/api/authors/:id` | Actualiza los datos de un autor (`name`, `email`, `bio`) |
| `DELETE` | `/api/authors/:id` | Elimina un autor y sus posts asociados en cascada |
| `GET` | `/api/authors/:id/posts`| Lista todas las publicaciones pertenecientes a un autor |

### 📰 Publicaciones (`/api/posts`)
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/posts` | Lista publicaciones (con autor asociado vía JOIN) |
| `GET` | `/api/posts/:id` | Obtiene una publicación por su ID |
| `POST` | `/api/posts` | Crea una publicación (`author_id`, `title`, `content`, `published`) |
| `PUT` | `/api/posts/:id` | Actualiza una publicación (`title`, `content`, `published`, `author_id`) |
| `DELETE` | `/api/posts/:id` | Elimina una publicación de la base de datos |

---

## 🔍 Ejemplos de Filtros y Paginación en `/api/posts`

* **Filtrar por autor**:
  ```http
  GET /api/posts?author_id=1
  ```
* **Filtrar por estado publicado**:
  ```http
  GET /api/posts?published=true
  ```
* **Filtrar borradores (no publicados)**:
  ```http
  GET /api/posts?published=false
  ```
* **Paginación combinada**:
  ```http
  GET /api/posts?page=1&limit=5
  ```

---

## 💡 Ejemplos con `curl`

### Crear un Autor:
```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "Julio Cortázar", "email": "cortazar@example.com", "bio": "Escritor argentino."}'
```

### Crear una Publicación:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"author_id": 1, "title": "Rayuela", "content": "Contenido de la novela.", "published": true}'
```

### Listar Publicaciones de un Autor:
```bash
curl http://localhost:3000/api/authors/1/posts
```

---

## 🛡️ Formato de Respuestas de Error

Todos los errores devuelven un código HTTP acorde y una estructura JSON estandarizada:

```json
{
  "error": "Mensaje descriptivo del error."
}
```

* `400 Bad Request`: Parámetro `:id` no válido, cuerpo de solicitud incompleto o clave foránea inexistente.
* `404 Not Found`: Recurso o ruta no encontrada.
* `409 Conflict`: Correo electrónico ya registrado en el sistema.
* `500 Internal Server Error`: Error no controlado del servidor.

---

## 📄 Licencia

