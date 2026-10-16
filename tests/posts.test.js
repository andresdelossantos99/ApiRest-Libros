import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { pool } from "../source/dbConfig/db.js";

describe("CRUD, Filtros y Cascada de Publicaciones (/api/posts)", () => {
  let testAuthor = null;
  let createdPostId = null;

  before(async () => {
    // Crear un autor exclusivo para este suite de pruebas
    const res = await pool.query(
      "INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING id, name, email",
      [
        "Autor Suite Posts",
        `posts.tester.${Date.now()}@example.com`,
        "Autor creado para pruebas de publicaciones",
      ]
    );
    testAuthor = res.rows[0];
  });

  after(async () => {
    // Si queda el autor de prueba, borrarlo (eliminará posts asociados por CASCADE)
    if (testAuthor) {
      await pool.query("DELETE FROM authors WHERE id = $1", [testAuthor.id]);
    }
    await pool.end();
  });

  it("GET /api/posts debe retornar 200 y un array de publicaciones", async () => {
    const res = await request(app).get("/api/posts");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it("POST /api/posts debe fallar con 400 si faltan campos obligatorios", async () => {
    const res = await request(app).post("/api/posts").send({});
    assert.equal(res.status, 400);
    assert.match(res.body.error, /author_id es obligatorio/i);
  });

  it("POST /api/posts debe fallar con 400 si el autor no existe", async () => {
    const res = await request(app).post("/api/posts").send({
      author_id: 999999,
      title: "Título de prueba",
      content: "Contenido de prueba",
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /no existe/i);
  });

  it("POST /api/posts debe fallar con 400 si published no es booleano", async () => {
    const res = await request(app).post("/api/posts").send({
      author_id: testAuthor.id,
      title: "Título de prueba",
      content: "Contenido de prueba",
      published: "si",
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /booleano/i);
  });

  it("POST /api/posts debe crear una publicación exitosamente con 201", async () => {
    const res = await request(app).post("/api/posts").send({
      author_id: testAuthor.id,
      title: "Publicación de Prueba Automatizada",
      content: "Contenido completo de la publicación de prueba.",
      published: true,
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.id);
    assert.equal(res.body.author_id, testAuthor.id);
    assert.equal(res.body.title, "Publicación de Prueba Automatizada");
    assert.equal(res.body.published, true);
    assert.equal(res.body.author_name, testAuthor.name);
    createdPostId = res.body.id;
  });

  it("GET /api/posts?author_id=... debe filtrar correctamente por autor", async () => {
    const res = await request(app).get(`/api/posts?author_id=${testAuthor.id}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 1);
    assert.ok(res.body.every((p) => p.author_id === testAuthor.id));
  });

  it("GET /api/posts?published=true debe filtrar por estado publicado", async () => {
    const res = await request(app).get("/api/posts?published=true");
    assert.equal(res.status, 200);
    assert.ok(res.body.every((p) => p.published === true));
  });

  it("GET /api/posts?limit=1&page=1 debe limitar la cantidad de resultados", async () => {
    const res = await request(app).get("/api/posts?limit=1&page=1");
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
  });

  it("GET /api/authors/:id/posts debe retornar publicaciones del autor", async () => {
    const res = await request(app).get(`/api/authors/${testAuthor.id}/posts`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.some((p) => p.id === createdPostId));
  });

  it("GET /api/authors/:id/posts debe responder 404 si el autor no existe", async () => {
    const res = await request(app).get("/api/authors/999999/posts");
    assert.equal(res.status, 404);
    assert.match(res.body.error, /no encontrado/i);
  });

  it("GET /api/posts/:id debe obtener el post por ID con código 200", async () => {
    const res = await request(app).get(`/api/posts/${createdPostId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, createdPostId);
    assert.equal(res.body.title, "Publicación de Prueba Automatizada");
  });

  it("PUT /api/posts/:id debe actualizar el post con 200", async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .send({
        title: "Título Modificado",
        published: false,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.title, "Título Modificado");
    assert.equal(res.body.published, false);
  });

  it("DELETE /api/posts/:id debe eliminar el post con 200", async () => {
    const res = await request(app).delete(`/api/posts/${createdPostId}`);
    assert.equal(res.status, 200);
    assert.match(res.body.message, /eliminada con éxito/i);

    const checkRes = await request(app).get(`/api/posts/${createdPostId}`);
    assert.equal(checkRes.status, 404);
    createdPostId = null;
  });

  it("ON DELETE CASCADE: eliminar un autor debe eliminar automáticamente sus posts en cascada", async () => {
    // 1. Crear autor temporal
    const aRes = await pool.query(
      "INSERT INTO authors (name, email) VALUES ($1, $2) RETURNING id",
      ["Autor Cascada", `cascade.${Date.now()}@example.com`]
    );
    const cascadeAuthorId = aRes.rows[0].id;

    // 2. Crear post asociado
    const pRes = await pool.query(
      "INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3) RETURNING id",
      [cascadeAuthorId, "Post en Cascada", "Contenido a eliminar automáticamente"]
    );
    const cascadePostId = pRes.rows[0].id;

    // 3. Eliminar el autor via API DELETE /api/authors/:id
    const delRes = await request(app).delete(`/api/authors/${cascadeAuthorId}`);
    assert.equal(delRes.status, 200);

    // 4. Verificar que el post ya no existe en la base de datos
    const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [cascadePostId]);
    assert.equal(postCheck.rows.length, 0);
  });
});
