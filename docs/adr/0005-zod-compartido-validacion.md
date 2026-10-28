# 0005. Cómo se valida una estrategia

## Contexto

Una estrategia puede estar mal de dos formas. Puede estar mal escrita, por ejemplo con un neumático que no existe o vueltas con decimales. O puede estar bien escrita y no servir para esa carrera: las vueltas no suman el total o faltan paradas. Lo segundo solo se sabe después de consultar la carrera.

## Decisión

- **Forma.** Un esquema de Zod en `packages/shared` describe cómo es una estrategia, y lo usan la web y la API. Si no cumple, la API responde `400 VALIDATION_ERROR` y dice qué campo falla.
- **Reglas de la carrera.** La API comprueba que las vueltas sumen las de la carrera y que haya las paradas mínimas. Si no, responde `422 INVALID_STRATEGY`.
- Lo que llega de la API de F1 también se revisa con Zod antes de usarlo.

## Consecuencias

- La forma se define una sola vez, así que la web y la API no pueden contradecirse.
- El código de respuesta distingue "me mandaste algo roto" (400) de "se entiende, pero no vale para esta carrera" (422).
- Las reglas de la carrera se revisan en los dos lados: la web avisa antes de enviar, pero la que decide es la API.
