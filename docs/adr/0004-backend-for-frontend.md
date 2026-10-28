# 0004. Backend for Frontend

## Contexto

Cada pantalla necesita datos de varios endpoints de la API F1 (carrera, circuito, clima, parámetros, neumáticos, pilotos, equipos), con identificadores cruzados y un formato `{statusCode, code, message, data}`.

## Decisión

El frontend solo habla con nuestra API. Cada endpoint devuelve lo que una pantalla necesita ya combinado (por ejemplo `GET /api/races/:raceId` junta carrera, circuito, clima, parámetros y neumáticos). Contrato en `docs/api.md`.

## Consecuencias

- (+) El frontend no conoce la API externa ni sus errores; hay un único formato de error propio.
- (+) La integración, el caché y la validación quedan en un solo lugar.
- (−) Hay una capa más que mantener cuando la API externa cambia.
