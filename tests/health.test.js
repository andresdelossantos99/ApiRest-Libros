import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";
import { pool } from "../source/dbConfig/db.js";

describe("Health Check y Documentación API", () => {
  after(async () => {
    await pool.end();
  });

  it("GET /api/health debe responder 200 con estado ok", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
    assert.equal(res.body.message, "API funcionando correctamente");
  });

  it("GET /api/docs.json debe responder 200 y contener la especificación OpenAPI", async () => {
    const res = await request(app).get("/api/docs.json");
    assert.equal(res.status, 200);
    assert.equal(res.body.openapi, "3.0.3");
    assert.equal(res.body.info.title, "API REST de Libros y Autores");
    assert.ok(res.body.paths["/authors"]);
    assert.ok(res.body.paths["/posts"]);
  });

  it("GET /api/docs/ debe responder 200 y servir la interfaz Swagger UI", async () => {
    const res = await request(app).get("/api/docs/");
    assert.equal(res.status, 200);
    assert.match(res.text, /<title>Swagger UI<\/title>/i);
  });

  it("GET /api/ruta-inexistente debe responder 404", async () => {
    const res = await request(app).get("/api/ruta-inexistente");
    assert.equal(res.status, 404);
    assert.equal(res.body.error, "Ruta no encontrada");
  });
});
