# 0006. Integración resiliente con la API externa

## Contexto

La API F1 está en un plan gratuito que se duerme: la primera respuesta puede tardar cerca de 60 segundos y puede fallar de forma transitoria. Sus datos no cambian entre requests.

## Decisión

`HttpF1Repository`, sobre `fetch` nativo:

- Timeout de 70 s por request.
- Un reintento ante error de red o 5xx; no se reintenta ante 4xx ni timeout.
- Caché en memoria sin vencimiento para respuestas exitosas; los errores no se cachean.
- Desempaqueta `data` y valida con Zod; una respuesta inválida o vacía es un error.
- Traducción de errores: timeout a `504 UPSTREAM_TIMEOUT`, el resto a `502 UPSTREAM_ERROR`; un 404 de carrera o piloto a `404 RACE_NOT_FOUND` / `DRIVER_NOT_FOUND`.

## Consecuencias

- (+) Tras el primer request la app responde sin depender de la API externa.
- (+) Los errores del upstream llegan al usuario como mensajes claros en español.
- (−) El caché no se invalida: si los datos de origen cambian hay que reiniciar el servidor.
- (−) El caché es por proceso y no se comparte entre instancias.
