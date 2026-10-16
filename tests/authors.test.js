import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { pool } from "../source/dbConfig/db.js";

describe("CRUD y Validaciones de Autores (/api/authors)", () => {
  let createdAuthorId = null;
  const uniqueEmail = `test.author.${Date.now()}@example.com`;

  after(async () => {
    // Limpieza de datos creados si quedaron pendientes
    if (createdAuthorId) {
      await pool.query("DELETE FROM authors WHERE id = $1", [createdAuthorId]);
    }
    await pool.end();
  });

  it("GET /api/authors debe devolver un array con código 200", async () => {
    const res = await request(app).get("/api/authors");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  it("POST /api/authors debe fallar con 400 si faltan datos obligatorios", async () => {
    const res = await request(app)
      .post("/api/authors")
      .send({});
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it("POST /api/authors debe fallar con 400 si el email no es válido", async () => {
    const res = await request(app)
      .post("/api/authors")
      .send({ name: "Autor Test", email: "correo-invalido" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /formato del email/i);
  });

  it("POST /api/authors debe crear un autor exitosamente con 201", async () => {
    const res = await request(app)
      .post("/api/authors")
      .send({
        name: "Autor Automatizado",
        email: uniqueEmail,
        bio: "Biografía de prueba automatizada.",
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.id);
    assert.equal(res.body.name, "Autor Automatizado");
    assert.equal(res.body.email, uniqueEmail);
    assert.equal(res.body.bio, "Biografía de prueba automatizada.");
    createdAuthorId = res.body.id;
  });

  it("POST /api/authors debe rechazar emails duplicados con 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/authors")
      .send({
        name: "Otro Autor",
        email: uniqueEmail,
      });

    assert.equal(res.status, 409);
    assert.ok(res.body.error);
  });

  it("GET /api/authors/:id debe fallar con 400 si el ID no es numérico", async () => {
    const res = await request(app).get("/api/authors/no-es-numero");
    assert.equal(res.status, 400);
    assert.match(res.body.error, /entero positivo/i);
  });

  it("GET /api/authors/:id debe responder 404 si el autor no existe", async () => {
    const res = await request(app).get("/api/authors/9999999");
    assert.equal(res.status, 404);
    assert.match(res.body.error, /no encontrado/i);
  });

  it("GET /api/authors/:id debe retornar el autor creado con 200", async () => {
    const res = await request(app).get(`/api/authors/${createdAuthorId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, createdAuthorId);
    assert.equal(res.body.email, uniqueEmail);
  });

  it("PUT /api/authors/:id debe fallar con 400 si el body está vacío", async () => {
    const res = await request(app)
      .put(`/api/authors/${createdAuthorId}`)
      .send({});
    assert.equal(res.status, 400);
    assert.match(res.body.error, /al menos un campo/i);
  });

  it("PUT /api/authors/:id debe actualizar el autor exitosamente con 200", async () => {
    const res = await request(app)
      .put(`/api/authors/${createdAuthorId}`)
      .send({
        name: "Autor Automatizado Modificado",
        bio: "Biografía actualizada.",
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.name, "Autor Automatizado Modificado");
    assert.equal(res.body.bio, "Biografía actualizada.");
  });

  it("DELETE /api/authors/:id debe eliminar el autor con 200", async () => {
    const res = await request(app).delete(`/api/authors/${createdAuthorId}`);
    assert.equal(res.status, 200);
    assert.match(res.body.message, /eliminado con éxito/i);

    // Verificar que ya no existe (404)
    const checkRes = await request(app).get(`/api/authors/${createdAuthorId}`);
    assert.equal(checkRes.status, 404);
    createdAuthorId = null; // ya fue eliminado
  });

  it("DELETE /api/authors/:id debe responder 404 si se intenta borrar de nuevo", async () => {
    const res = await request(app).delete("/api/authors/9999999");
    assert.equal(res.status, 404);
  });
});
