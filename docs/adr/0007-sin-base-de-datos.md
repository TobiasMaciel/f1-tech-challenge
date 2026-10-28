# 0007. Sin base de datos

## Contexto

Todos los datos (carreras, circuitos, pilotos, neumáticos) vienen de la API de F1. El challenge no pide usuarios ni guardar estrategias, y simular no crea nada: solo calcula.

## Decisión

La API no tiene base de datos. Lo único que guarda es el caché en memoria del ADR 0006. `POST /api/simulations` calcula y responde `200`.

## Consecuencias

- Para correr el proyecto alcanza con `npm install` y `npm run dev`.
- Las estrategias no se guardan: al recargar la página se pierden. La comparación con la simulación anterior vive solo mientras la página está abierta.
- Guardarlas pediría una base relacional y usuarios; queda como mejora.
