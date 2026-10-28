# 03: Elegir carrera

**Qué construir:** el usuario ve las 7 carreras como tarjetas (trazado, bandera, ronda, nombre, vueltas, probabilidad de lluvia) y puede seleccionar una. El backend obtiene los datos de la API F1 a través del repository, con todo el manejo de fallas del proveedor. Ver [spec](../spec.md): "Patrón Repository", "Errores", historias 1-4, 26, 27, 33-36.

**Depende de:** 01, 02

- [x] Interfaz `F1Repository` e implementación HTTP: quita el envoltorio, valida con Zod, timeout, un reintento, caché en memoria sin vencimiento
- [x] Fallas del proveedor traducidas: respuesta con error o vacía/inválida → 502 `UPSTREAM_ERROR`; sin respuesta a tiempo → 504 `UPSTREAM_TIMEOUT`
- [x] `GET /api/races` según `docs/api.md` (carreras con nombre y país del circuito)
- [x] Tarjetas de carrera con trazado, bandera (flag-icons), ronda, nombre, vueltas y probabilidad de lluvia; selección visible
- [x] "Cargando datos…" si la carga supera 3 s; aviso de error con botón "Reintentar"
- [x] Tests de integración (Supertest + MSW): 200 con la forma esperada, 502 por error del proveedor, 502 por respuesta vacía, 504 por timeout
