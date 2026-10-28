# 0004. La web solo habla con nuestra API

## Contexto

Para mostrar una carrera hacen falta datos de varios endpoints de la API de F1: la carrera, el clima, los parámetros y los neumáticos. Además vienen conectados por ids (la carrera dice qué circuito usa, el piloto a qué equipo pertenece) y dentro de un envoltorio `{statusCode, code, message, data}`.

## Decisión

La web nunca llama a la API de F1. Nuestra API pide lo necesario, lo junta y devuelve a cada pantalla exactamente lo que muestra. Por ejemplo, `GET /api/races/:raceId` devuelve en una sola respuesta la carrera con su circuito, el clima, los parámetros y los neumáticos. El contrato está en `docs/api.md`.

## Consecuencias

- La web no sabe nada de la API externa: sus errores llegan siempre con nuestro formato y en español.
- Si la API de F1 cambia, se ajusta un solo lugar.
- Es una pieza más para mantener.
