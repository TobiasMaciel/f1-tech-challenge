# 04: Información de la carrera

**Qué construir:** al elegir una carrera, el usuario ve el circuito, el clima por tramos, los neumáticos y los riesgos. Ver [spec](../spec.md): historias 5-10, contrato de `GET /api/races/:raceId`.

**Depende de:** 03

- [x] `GET /api/races/:raceId` combina carrera, circuito, clima, parámetros de simulación y neumáticos según `docs/api.md`
- [x] 404 `RACE_NOT_FOUND` si la carrera no existe; 400 `VALIDATION_ERROR` si el id tiene formato inválido
- [x] Bloque de circuito: trazado, tipo, largo, vueltas, vuelta base, desgaste, dificultad de adelantamiento, pérdida en boxes
- [x] Bloque de clima: resumen y barra de vueltas por tramos coloreada según la lluvia, con temperatura por tramo
- [x] Bloque de neumáticos: ritmo, degradación, rendimiento en mojado y banda óptima de cada compuesto, con íconos de compuesto en colores oficiales
- [x] Línea de riesgos: probabilidad de safety car y variabilidad por vuelta
- [x] Tests de integración: 200 con todos los bloques de datos, 404, 400
