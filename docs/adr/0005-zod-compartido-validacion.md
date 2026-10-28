# 0005. Zod compartido y validación en dos niveles

## Contexto

El formulario del frontend y el endpoint de simulación validan la misma estructura. Además hay reglas que dependen de la carrera (cantidad de vueltas, paradas mínimas) y que solo se conocen tras consultar la API F1.

## Decisión

- Nivel 1, forma: el esquema Zod de `packages/shared` lo usan el formulario web y el backend. Un fallo responde `400 VALIDATION_ERROR` con `details` por campo.
- Nivel 2, reglas de la carrera: `validateStrategy` en el motor comprueba que las vueltas sumen las de la carrera y que se cumpla el mínimo de paradas. Un fallo responde `422 INVALID_STRATEGY`.
- Las respuestas de la API F1 también se validan con Zod al entrar.

## Consecuencias

- (+) Una sola definición de la forma; el formulario y el servidor no pueden discrepar.
- (+) El código HTTP distingue un request mal formado (400) de una estrategia legible pero inválida (422).
- (−) Las reglas de nivel 2 no se pueden validar en el cliente sin los datos de la carrera; el frontend muestra el error del servidor.
