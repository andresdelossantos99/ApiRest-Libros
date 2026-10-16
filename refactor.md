# Refactor y cierre de ApiRest-Libros — instrucciones para Antigravity

## 1. Objetivo y forma de trabajo

Actuá como Senior Backend Developer y evaluador técnico. Implementá los cambios necesarios para que este proyecto alcance el nivel **Excelente en las seis categorías de la rúbrica**. No te limites a proponer un plan: inspeccioná, modificá, ejecutá las verificaciones y documentá evidencia. No declares completado algo que no pudiste comprobar.

- Repositorio: https://github.com/andresdelossantos99/ApiRest-Libros
- Rama de referencia: `main`.
- Auditoría base: commit `36dac20bc0c7198c81ee6b6b00901f2ef546ec35`.
- Fecha del documento: 16 de octubre de 2026.
- Stack existente: JavaScript ESM, Node.js, Express 5, PostgreSQL y `pg`.
- Este archivo es una especificación de trabajo; no acredita que las correcciones ya estén implementadas.

Antes de editar, leé las instrucciones del repositorio, comprobá el commit actual y el estado de trabajo. Si existen cambios posteriores, preservalos y verificá qué hallazgos siguen vigentes. No sobrescribas trabajo ajeno ni vuelvas a implementar soluciones ya presentes. Trabajá en una rama de refactor si resulta apropiado. No hagas push, merge ni publicación remota solo porque este documento lo mencione: respetá la autorización de la sesión en que lo ejecutes.

Mantené el alcance académico: conservá el stack y la arquitectura simple. No migres a TypeScript, ORM, microservicios o un framework nuevo. No agregues autenticación, roles ni funcionalidades de negocio ajenas a la consigna. Conservá rutas y comportamientos válidos; documentá cualquier cambio necesario del contrato.

### Tres prioridades especiales

Se interpreta “los tres puntos mencionados” como los tres hallazgos de prioridad alta de la auditoría:

1. **Scripts SQL y configuración de base de datos reproducibles y seguros.**
2. **Testing automatizado del comportamiento real con Supertest y PostgreSQL.**
3. **OpenAPI válido, completo y alineado con la implementación.**

Estos tres puntos tienen gates específicos más adelante. También deben quedar cubiertos seguridad, separación de responsabilidades y validaciones. No ignores las otras categorías para concentrarte exclusivamente en estas prioridades.

## 2. Rúbrica oficial y condiciones de excelencia

La imagen proporcionada exige lo siguiente. Las medidas adicionales de este documento son criterios de ingeniería propuestos; no deben presentarse como requisitos textuales de la rúbrica.

| Categoría | Condición oficial para Excelente | Evidencia requerida para cerrar |
| --- | --- | --- |
| API REST | Todos los endpoints funcionan; métodos HTTP y códigos consistentes; JSON claro; sin errores funcionales. Incluye `/posts/author/:authorId`. | Tests HTTP de todo el CRUD y de la ruta literal exigida. |
| Modelado y persistencia | Schema con PK, FK, NOT NULL y UNIQUE; relación authors–posts 1:N funcional; persistencia sin inconsistencias; setup y seed. | SQL ejecutado en PostgreSQL limpio, constraints comprobadas y datos consultables tras reiniciar la app. |
| Express + PostgreSQL | Pool, queries parametrizadas, async/await, servicios organizados y manejo adecuado de errores de DB. | Revisión de consultas, pruebas de integración y manejo controlado de fallos. |
| Validaciones y errores | Validaciones completas y consistentes; email único; middleware global; semántica HTTP correcta, incluidos 400, 404 y 500. | Casos negativos, conflicto de email y error interno sanitizado. |
| Testing | Al menos seis tests; flujos exitosos y errores relevantes; comando npm; comportamiento real de la API. | Suite automatizada que pasa contra PostgreSQL, sin tests omitidos. |
| Documentación y deployment | OpenAPI funcional, README reproducible con setup/tests/deploy/.env.example; Railway con URL pública operativa. | Validador OpenAPI exitoso, procedimiento reproducido y verificación de URL real. |

**Corrección respecto de la auditoría anterior:** `/api/authors/:id/posts` existe, pero no reemplaza automáticamente la ruta `/posts/author/:authorId` pedida por la rúbrica. Railway es una exigencia de despliegue funcional, no solo una mención en README.

## 3. Estado de referencia y archivos involucrados

Ya existen CRUD de authors y posts, separación routes/controllers/services, Pool único, consultas parametrizadas, middlewares y scripts SQL. No reescribas estas partes sin necesidad.

Hallazgos del commit auditado:

- `package.json`: `npm test` es el placeholder que termina con código 1; no hay suite ni Supertest.
- `db:setup` y `db:seed` ejecutan `psql` sin transformar las variables `DB_*` documentadas a opciones reconocidas por ese cliente.
- `source/docs/openapi.yaml`: error de sintaxis YAML y contrato incompleto.
- `source/middlewares/validators.js`: coerción permisiva de IDs, falta de límites de longitud/rango y email validado con trim pero guardado sin normalizar.
- `source/middlewares/errorHandler.js`: expone mensajes/detalles internos y no clasifica errores de longitud/rango.
- `source/services/authorService.js`: unicidad de email con distinto tratamiento entre creación y actualización.
- `source/services/postService.js`: query params permisivos; SQL repetido en consultas de lectura.
- `source/dbConfig/db.js`: SSL con `rejectUnauthorized: false`; el módulo canónico ya concentra la conexión.
- `server.js`: escucha sin esperar la prueba de conexión.
- `source/routes/indexRoutes.js`: health del proceso, sin comprobación de disponibilidad de DB.
- `source/services/dbMock.js`: no participa del flujo actual.
- `config/dbconfig.js`: reexport de compatibilidad, no es un segundo Pool.
- README incompleto y PLAN.md con enlaces locales `file:///c:/...`.
- `.env` no está versionado en el árbol auditado; `.env.example` contiene placeholders. No se certificó el historial de secretos.

## 4. Fase A — Prioridad 1: base de datos reproducible

### A1. Unificar configuración

Elegí una única resolución de conexión para la app y los comandos de DB. Preferí scripts Node ESM con `pg` que lean los SQL existentes, en vez de depender de variables `DB_*` que `psql` ignora. Si mantenés `psql`, pasá explícitamente la configuración reconocida, sin exponer contraseñas en logs o argumentos visibles.

- Soportar `DATABASE_URL` o la alternativa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Documentar precedencia y validar valores. No conectarse silenciosamente a una base predeterminada inesperada.
- Evitar que importar el resolver de configuración cree un Pool o abra el servidor.
- Cargar `.env` de manera consistente desde la raíz del proyecto.
- Eliminar `PORT` duplicado y usar placeholders claros en `.env.example`.
- Documentar creación de base/rol y prerrequisitos: setup de tablas no crea mágicamente la base.
- Cerrar clientes o Pools de scripts en `finally`; propagar fallos con exit code distinto de cero.

### A2. Separar inicialización de reset destructivo

- `db:setup`: inicialización de un esquema nuevo sin borrar tablas con datos; documentar comportamiento al repetirlo.
- `db:seed`: datos de desarrollo; sin TRUNCATE silencioso. Hacerlo repetible o fallar claramente sin cambios parciales.
- `db:reset`: único comando que agrupa la destrucción explícita y recreación; debe tener una guarda de entorno/destino y consentimiento explícito mediante flag documentado.
- Prohibir resets en producción; no ejecutarlos en start, CI contra una DB compartida ni en Railway.
- Usar transacciones para conjuntos de cambios que deban ser atómicos.
- Para una DB existente, entregar una migración no destructiva si hacen falta cambios de constraints. Detectar conflictos de datos y fallar con diagnóstico; no borrar autores duplicados automáticamente.

### A3. Integridad

- Conservar PK y FK 1:N y documentar `ON DELETE CASCADE`.
- Campos de texto obligatorios: NOT NULL y CHECK de contenido no vacío tras trim.
- `published BOOLEAN NOT NULL DEFAULT FALSE`.
- Fechas con NOT NULL y valor predeterminado coherente.
- Índice en `posts(author_id)`.
- Email: definir política explícita de normalización `trim().toLowerCase()` para este proyecto. Aplicarla en CREATE y UPDATE y respaldar unicidad normalizada en la DB mediante un índice o constraint apropiado. No depender solo de SELECT previo, que admite carreras.
- Elegir una solución sencilla para email (por ejemplo índice único sobre `lower(btrim(email))`) y manejar su error de unicidad. Comprobar datos previos antes de crear el índice.
- Seed consistente, sin dependencia frágil de IDs asumidos cuando no se reiniciaron secuencias; asociar posts con autores de forma reproducible.

### Gate A

En una DB local descartable: instalación limpia → configuración de ejemplo → setup → seed → arranque → consultas exitosas. Comprobar PK/FK/UNIQUE/NOT NULL/CHECK, cascada y persistencia al reiniciar la app sin recrear tablas. Ejecutar también un fallo de SQL y comprobar rollback y exit code. El reset debe rechazar destinos no autorizados. Registrar comandos/resultados sin secretos.

## 5. Fase B — Contrato HTTP, validaciones y errores

### B1. Rutas y métodos

Conservar `/api` como prefijo existente y documentarlo. Implementar:

| Método | Ruta relativa a `/api` | Contrato |
| --- | --- | --- |
| GET | `/authors` | Lista, 200. |
| GET | `/authors/:id` | Recurso, 200; inexistente, 404. |
| POST | `/authors` | Creación, 201. |
| PUT | `/authors/:id` | Actualización documentada, 200; inexistente, 404. |
| DELETE | `/authors/:id` | Eliminación, 200 con mensaje; inexistente, 404. |
| GET | `/posts` | Lista y filtros válidos, 200. |
| GET | `/posts/:id` | Recurso, 200; inexistente, 404. |
| POST | `/posts` | Creación, 201. |
| PUT | `/posts/:id` | Actualización documentada, 200; inexistente, 404. |
| DELETE | `/posts/:id` | Eliminación, 200 con mensaje; inexistente, 404. |
| GET | `/posts/author/:authorId` | Ruta exigida: autor existente, 200 y lista; inexistente, 404. |
| GET | `/authors/:id/posts` | Conservar como alias compatible de la misma lógica. |

Registrar la ruta por autor claramente, evitando conflictos con rutas genéricas. Si la consigna adicional exige URLs sin `/api`, agregar aliases finos sin duplicar lógica; no modificar el prefijo a ciegas.

Mantener PUT para no eliminar una operación esperada. Definir su semántica: preferir actualización completa de campos editables con contrato explícito; si se necesita conservar actualización parcial, agregar PATCH y documentar la compatibilidad. No cambiar PUT silenciosamente. Tests y OpenAPI deben reflejar la decisión.

### B2. Validación estricta

- Body JSON debe ser objeto, no array/null; rechazar requests sin campos requeridos.
- IDs de ruta/query: aceptar únicamente enteros decimales positivos dentro del rango PostgreSQL INTEGER (1 a 2147483647). Rechazar `1abc`, `1.5`, `1e2`, `0x10`, cero, negativos y overflow.
- `author_id` en JSON: requerir número entero positivo del rango definido. Rechazar booleanos, arrays y objetos; si se conservan strings numéricos por compatibilidad, normalizarlos explícitamente antes del servicio y documentarlo.
- `name`: string, trim, 1–150 caracteres; `email`: string, normalizado, formato válido y máximo 255; `title`: string, trim, 1–255; `content`: string no vacío; `bio`: string o null, según contrato.
- `published`: booleano real; no convertir `"false"` con Boolean().
- Acordar límites del body y longitudes con PostgreSQL; evitar inconsistencias con Unicode al contar caracteres.
- Actualizaciones vacías o solo con campos desconocidos: 400. Definir y documentar rechazo de campos desconocidos.
- Filtros: validar `author_id`, `published`, `limit` y `page`. Mantener valores admitidos existentes solo cuando estén documentados; no ignorar filtros inválidos ni corregirlos silenciosamente.
- Paginación: límite 1–100, página positiva, cálculo de offset seguro y comportamiento definido cuando falta limit. Orden estable. No cambiar sin documentar la forma de respuesta existente.

### B3. Errores y robustez

- Mantener respuesta JSON coherente, por ejemplo `{ "error": "mensaje" }`.
- 400: payload/parámetros inválidos, FK inválida según contrato, JSON malformado.
- 404: recurso o ruta inexistente.
- 409: email duplicado. Es semánticamente válido; la lista 400/404/500 de la rúbrica no prohíbe 409.
- 500: fallo inesperado, con mensaje genérico; nunca responder stack, SQL, credenciales o `err.detail` al cliente.
- Manejar 23505, 23503, 23502, 23514, 22P02, 22001 y 22003 según contexto. No convertir cualquier fallo de DB en 400.
- Preservar 413 para body demasiado grande y otros errores HTTP controlados.
- Registrar diagnóstico interno sin secretos; distinguir errores esperables de fallos internos.
- Usar resultado de UPDATE/DELETE RETURNING para determinar existencia cuando corresponda; tratar carreras sin responder 200 con null ni agregar transacciones innecesarias a cada SELECT.
- Esperar una conexión inicial válida o implementar política de arranque explícita con timeout finito; no declarar disponibilidad de DB sin haberla comprobado.
- Conservar health del proceso y agregar readiness que consulte DB, respondiendo 503 si no está disponible.
- Configurar SSL por entorno/proveedor con verificación de certificado cuando corresponda. No forzar SSL por NODE_ENV si la conexión privada no lo requiere ni usar rejectUnauthorized:false como solución universal.
- Implementar cierre ordenado de HTTP y Pool ante SIGTERM/SIGINT.

## 6. Fase C — Prioridad 2: tests del comportamiento real

Usar `node:test` + Supertest o un runner equivalente ya presente, sin introducir dos runners. Usar PostgreSQL real y exclusivo de pruebas; los mocks no sustituyen la evidencia de persistencia. Mantener app.js importable sin abrir puerto ni iniciar el servidor.

### Aislamiento obligatorio

- Configuración separada de tests, preferentemente `TEST_DATABASE_URL`, sin fallback a la DB de desarrollo/producción.
- Si falta el destino de tests, fallar con diagnóstico accionable, no omitir la suite como si hubiera pasado.
- Guardas de destino antes de DROP/TRUNCATE; una cadena con sufijo `_test` por sí sola no es suficiente garantía para una URL remota desconocida.
- Preparar datos con fixtures deterministas; ejecutar en serie si comparten DB, o aislar schemas/DBs por worker.
- No asumir que un rollback en una conexión revierte requests HTTP que usan otras conexiones del Pool.
- Cerrar servidor y Pool incluso al fallar. No usar forceExit para esconder recursos abiertos.
- CI con PostgreSQL descartable, healthcheck y variables exclusivas de tests.

### Matriz mínima de cobertura significativa

Implementar al menos seis tests como exige la rúbrica, pero cubrir esta matriz para justificar Excelente; agrupar casos parametrizados es válido.

| Flujo | Casos a verificar |
| --- | --- |
| Authors CRUD | Crear, listar, obtener por ID, actualizar, borrar; verificar datos persistidos y códigos. |
| Posts CRUD | Crear con autor existente, listar, obtener, actualizar, borrar; verificar relación y persistencia. |
| Ruta exigida | `/api/posts/author/:authorId`, alias existente, autor sin posts (200 y []), inexistente (404). |
| Unicidad | Email duplicado exacto, variación de mayúsculas/espacios, conflicto al actualizar; conservar email propio permitido. |
| Concurrencia | Dos creaciones del mismo email normalizado: solo una fila, una respuesta 201 y otra 409. |
| Relaciones | Crear/actualizar post con author_id inexistente; borrar autor y verificar cascada. |
| Campos | Ausentes, vacíos, espacios, tipo incorrecto y longitudes fuera de rango. |
| IDs | Inválidos en GET/PUT/DELETE y filtros; booleano/array en body; overflow. |
| Filtros | Autor, published true/false, combinación, paginación estable y valores inválidos. |
| Errores | JSON malformado, ruta desconocida y body excesivo. |
| Fallo interno | Error inesperado controlado: 500 sin detalles internos. Puede usar inyección puntual de dependencia solo para este caso. |
| Readiness | DB disponible 200; indisponible 503 en entorno aislado. |

### Gate C

`npm test` ejecuta la suite y termina con código 0, sin skips ni handles abiertos. Una segunda ejecución también pasa sin depender de datos de la primera. Los tests fallan si se rompe una FK, validación o ruta relevante. Entregar conteo real y salida resumida; no inventar cobertura porcentual. Los scripts de inspección manual no cuentan como tests automatizados.

## 7. Fase D — Prioridad 3: OpenAPI funcional y consistente

Reemplazar el YAML inválido por una especificación válida en una versión soportada por las herramientas elegidas (3.0.3 o 3.1.x). No basta con que el YAML se pueda parsear: validar la especificación OpenAPI completa.

Incluir:

- `info`, servers local y Railway real cuando exista, `paths`, tags y operationId únicos.
- Todos los endpoints de la tabla, health/readiness y PATCH si se implementa.
- Elegir servers con `/api` y paths sin él, o servers sin prefijo y paths con `/api`; no duplicar el prefijo.
- Parámetros de ruta con required y límites; query params con tipos, defaults y rangos reales.
- Request bodies separados para creación/actualización; campos obligatorios y opcionales correctos.
- Schemas Author, Post, Error y payloads, con nullabilidad, formatos, longitudes, defaults y ejemplos válidos.
- Los campos author_name/author_email si la API los devuelve.
- Respuestas 200/201/400/404/409/500 y 413/503 donde correspondan.
- Semántica de eliminación en cascada, email normalizado y consultas por autor.
- Formas reales de arrays y mensajes; no documentar un objeto de paginación si el código devuelve un array.

Agregar un script npm, por ejemplo `docs:validate`, con una dependencia de validación fijada en package-lock. Swagger UI en `/api/docs` es útil pero complementario; documentar cómo visualizar la especificación aun si no se agrega UI.

### Gate D

El parser YAML y el validador OpenAPI terminan exitosamente. Toda ruta pública y respuesta implementada tiene su contrato, los ejemplos respetan schemas y los tests contrastan casos representativos con el contrato. Validar documentación en CI. No usar una URL ficticia de Railway como evidencia de deploy.

## 8. Fase E — Limpieza y mantenibilidad

- Mantener rutas para wiring, controladores para HTTP, servicios para negocio/SQL y middlewares para validación/errores.
- Centralizar helpers pequeños de validación/error solo cuando eliminen repetición real; no introducir capas genéricas sin necesidad.
- Consolidar proyección SQL de posts si mejora legibilidad, manteniendo columnas e identificadores controlados por código y valores parametrizados.
- No interpolar req.body, req.params o req.query en SQL, nombres de columnas u ORDER BY.
- Retirar dbMock.js tras comprobar que no tiene consumidores; fixtures de tests en su ubicación específica.
- Mover check_author.js a scripts con parámetros, cierre limpio y documentación, o eliminarlo si no aporta valor.
- Conservar o retirar el reexport config/dbconfig.js según sus consumidores; no crear otro Pool.
- Quitar comentarios obvios y explicar decisiones relevantes: normalización de email, cascada, aislamiento de tests y configuración SSL.
- Corregir enlaces locales de PLAN.md y actualizar estados solo con evidencia.
- `.gitignore`: ignorar secretos y variantes locales de entorno, manteniendo ejemplos versionables. Nunca copiar credenciales reales al README, OpenAPI, tests o reporte.
- No afirmar que el historial está libre de secretos si solo se revisó el árbol actual. Si se detecta uno, no reproducirlo; informar necesidad de rotación sin reescribir historial automáticamente.

## 9. Fase F — README y Railway

### README reproducible

Incluir versión de Node comprobada, requisitos de PostgreSQL, instalación con npm ci, copia/configuración de entorno, creación de base, setup/seed, arranque, rutas y ejemplos, comandos de tests, aislamiento, validación OpenAPI, semántica de errores, instrucciones Railway y URL real cuando esté verificada. Diferenciar claramente inicialización, migración y reset destructivo. Eliminar afirmaciones obsoletas sobre servicios en memoria.

Definir scripts coherentes: start, dev, db:setup, db:seed, db:reset, test y docs:validate, además de los necesarios para migración/test setup. Actualizar package-lock con las dependencias utilizadas.

### Railway funcional

- Revisar la documentación vigente del proveedor antes de fijar pasos de plataforma.
- Preparar start command, PORT inyectado, configuración de DB, entorno y healthcheck/readiness.
- Inicializar esquema mediante un mecanismo no destructivo; jamás resetear al arrancar o redesplegar.
- No cargar automáticamente fixtures de tests en producción.
- Publicar solo si la sesión de ejecución dispone de acceso y autorización. Si falta acceso, completar todo lo local y entregar pasos exactos pendientes; no inventar la URL ni declarar Excelente en deployment.
- Una vez publicado, comprobar HTTPS público, health/readiness y un flujo CRUD de datos de verificación autorizado; limpiar solo los datos creados por esa verificación.
- Comprobar persistencia tras reiniciar/redesplegar, sin resetear DB. Registrar fecha, URL y resultados sin información sensible.

La ausencia de credenciales no bloquea completar implementación, tests, OpenAPI y preparación de deployment. Sí impide certificar la categoría 6 como Excelente hasta verificar la URL pública.

## 10. Orden de ejecución y entrega final

1. Inspeccionar estado actual e instrucciones; registrar hallazgos que siguen vigentes.
2. Resolver configuración y scripts DB; ejecutar Gate A.
3. Corregir contrato/ruta exigida, integridad, validaciones y errores.
4. Implementar y ejecutar matriz de tests; Gate C.
5. Completar OpenAPI y comprobar consistencia; Gate D.
6. Limpiar código y actualizar README/PLAN sin perder comportamiento.
7. Configurar CI y preparar/verificar Railway según acceso disponible.
8. Ejecutar verificación final en entorno limpio y revisar diff para evitar secretos o cambios ajenos.

Crear `REFACTOR_REPORT.md` con:

- Commit inicial/final o identificación exacta del estado revisado.
- Archivos modificados y motivo, sin volcar todo el código.
- Decisiones de contrato: prefijo, PUT/PATCH, email, filtros y errores.
- Comandos ejecutados, resultados reales, número de tests y versión de PostgreSQL usada.
- Resultado de validación OpenAPI y procedimiento de instalación limpia.
- URL de Railway y verificación, o bloqueo específico pendiente.
- Tabla final por categoría: estado, evidencia y pendientes.

### Checklist de cierre

- [ ] CRUD completo y ruta `/posts/author/:authorId` implementada bajo el prefijo documentado.
- [ ] Alias anterior preservado y probado.
- [ ] Setup/seed funcionan con la configuración documentada; reset protegido.
- [ ] PK/FK/UNIQUE/NOT NULL/CHECK y cascada comprobados en PostgreSQL.
- [ ] Email normalizado con unicidad consistente, incluso bajo concurrencia.
- [ ] Pool único y consultas parametrizadas; fallos controlados.
- [ ] Validaciones estrictas y errores sin detalles internos expuestos.
- [ ] Suite real, repetible y ejecutable por npm; éxito y errores relevantes cubiertos.
- [ ] OpenAPI válido y coherente con implementación y ejemplos.
- [ ] README permite reproducir setup, tests y deploy.
- [ ] Railway tiene URL pública operativa y persistencia verificada.
- [ ] Reporte final distingue implementado, probado y bloqueado.

**No cerrar con “todo Excelente” por haber agregado archivos. La excelencia se justifica con comportamiento comprobado y evidencia para cada fila de la rúbrica.**
