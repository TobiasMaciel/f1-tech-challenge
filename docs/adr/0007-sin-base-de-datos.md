# 0007. Sin base de datos

## Contexto

Todos los datos (carreras, circuitos, pilotos, neumáticos) vienen de la API F1. El challenge no pide guardar estrategias ni usuarios, y simular no crea ningún recurso.

## Decisión

El backend no tiene base de datos ni estado propio, salvo el caché en memoria del ADR 0006. `POST /api/simulations` calcula y responde `200`.

## Consecuencias

- (+) Menos piezas para correr el proyecto: `npm install` y `npm run dev`.
- (+) El servicio es sin estado y fácil de desplegar.
- (−) Las estrategias no se guardan ni se pueden comparar entre sesiones.
- (−) Persistirlas requeriría una base relacional y un modelo de usuarios; queda como mejora.
