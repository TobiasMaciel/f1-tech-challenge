# 05: Elegir piloto

**Qué construir:** el usuario elige un piloto de una lista agrupada por equipo y ve su ficha. Ver [spec](../spec.md): historias 11-12, contrato de `GET /api/drivers`.

**Depende de:** 03

- [x] `GET /api/drivers` devuelve los pilotos con su equipo incluido según `docs/api.md`
- [x] Selector de piloto agrupado por equipo
- [x] Ficha del piloto: nombre, número, equipo, ritmo, rendimiento del auto, consistencia
- [x] Test de integración: 200 con cada piloto unido a su equipo
