# 06: Simulación mínima de punta a punta

**Qué construir:** el usuario arma stints (compuesto + vueltas), ve el contador de vueltas y la validación en vivo, simula y recibe el tiempo total y la tabla de stints. El motor cubre vuelta base, ritmo del compuesto, degradación y paradas. Ver [spec](../spec.md): "Motor de simulación", "Validación en dos niveles", historias 13-16, 18-20, 22, 25, 28; `docs/simulation-model.md`.

**Depende de:** 04, 05

- [x] Schema Zod compartido del request de simulación
- [x] Motor puro con TDD: vuelta base + ritmo + degradación (`degradation × edad × tyreWear`, edad 0 en la primera vuelta del stint) + `pitStopLoss + tyreChangeTime` por parada
- [x] Reglas en el motor: suma de vueltas igual a `race.laps`, cada stint ≥ 1 vuelta, paradas ≥ `minimumPitStops`
- [x] `POST /api/simulations`: 400 `VALIDATION_ERROR` con `details` por campo, 422 `INVALID_STRATEGY`, 404 `RACE_NOT_FOUND` / `DRIVER_NOT_FOUND`, 200 con `totalTime`, `stints`, `pitStops`, `laps`
- [x] Constructor: filas de stints (agregar/quitar), contador "N / total vueltas", validación en vivo con el schema compartido, botón Simular
- [x] Resultado: tiempo total formateado `h:mm:ss.mmm` y tabla de stints; errores 400/422 junto al formulario
- [x] Tests unitarios del motor y reglas; tests de integración del endpoint (200, 400, 422, 404); test de la app: armar stints y simular muestra el total
