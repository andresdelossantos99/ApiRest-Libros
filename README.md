# ApiRest-Libros — Instrucciones de base de datos

Este proyecto incluye tanto una versión "mock" en memoria como la conexión a una base de datos PostgreSQL.

## Estado actual
- El servicio de autores ([source/services/authorService.js]) fue actualizado para escribir y leer desde PostgreSQL usando la función `query` en `config/dbconfig.js`.
- Antes el proyecto usaba datos en memoria (source/services/dbMock.js). Ahora las operaciones CRUD en `/api/authors` persisten en la tabla `authors`.

## Precauciones importantes
- Los scripts en `config/` son destructivos si se ejecutan en una base de datos con datos reales:
  - `config/setup.sql` contiene `DROP TABLE IF EXISTS` y `CREATE TABLE`.
  - `config/seed.sql` contiene `TRUNCATE ... RESTART IDENTITY CASCADE` y `INSERT`.
- Los scripts se exponen vía `package.json`:
  - `npm run db:setup` — ejecuta setup.sql
  - `npm run db:seed` — ejecuta seed.sql
  - `npm run db:reset` — ejecuta setup + seed (¡peligroso en producción!)
  - `npm run dev:reset` — ejecuta db:reset y luego inicia el servidor
- Antes de ejecutar cualquiera de esos scripts, verificá el archivo `.env` para asegurarte de no apuntar a una base de datos de producción.

## Variables de entorno (.env)
Asegurate de tener un archivo `.env` en la raíz con al menos las siguientes variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apilibros
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=false
PORT=3000
```

`config/dbconfig.js` usa estas variables para conectar; el servidor ejecuta `testConnection()` al iniciar y mostrará un mensaje si la conexión es exitosa.

## Cómo probar localmente (rápido)
1. Instalar dependencias e iniciar el servidor:
   - npm install
   - npm start
   - Verificar en la consola: "✅ Conexión a PostgreSQL exitosa" y "🚀 Servidor corriendo en puerto 3000".

2. Crear un autor (ejemplo con PowerShell):
   ```powershell
   $json = @{ name='Nombre'; email='correo@ejemplo.com'; bio='...' } | ConvertTo-Json
   Invoke-RestMethod -Uri 'http://localhost:3000/api/authors' -Method Post -Body $json -ContentType 'application/json'
   ```

   Alternativa con curl (Linux/macOS / en cmd.exe ajustar comillas):
   ```bash
   curl -X POST "http://localhost:3000/api/authors" \
     -H "Content-Type: application/json" \
     -d '{"name":"Nombre","email":"correo@ejemplo.com","bio":"..."}'
   ```

3. Verificar en PostgreSQL (si tenés psql instalado):
   ```powershell
   $env:PGPASSWORD='tu_password'
   psql -h localhost -p 5432 -U postgres -d apilibros -c "SELECT id, name, email, bio, created_at FROM authors ORDER BY id DESC LIMIT 5;"
   ```

4. Si no tenés `psql` disponible, podés usar el script `check_author.js` (si existe) o crear uno similar que use `config/dbconfig.js` para consultar por email.

## Revertir a mock o alternar comportamiento
- Actualmente el servicio de autores ya fue actualizado para usar PostgreSQL. Si preferís mantener la opción de seleccionar entre mock y DB, se puede agregar una variable `USE_DB=true|false` y condicionar la importación/uso del servicio.

## Buenas prácticas recomendadas
- No ejecutar `npm run db:reset` en entornos con datos no respaldados.
- Usar migraciones (knex/migrate, sequelize-cli, Flyway, etc.) para cambios estructurales en lugar de `DROP/CREATE` manuales en producción.
- Hacer backups regulares de la base de datos antes de operaciones destructivas.

---
Actualizado: instrucciones añadidas sobre uso de la base de datos y precauciones.
