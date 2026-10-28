# 0006. Timeout, reintento y caché para la API de F1

## Contexto

La API de F1 está en un servicio gratuito que se duerme cuando nadie la usa. La primera respuesta puede tardar cerca de un minuto y a veces falla sin motivo. En cambio, sus datos no cambian.

## Decisión

Todas las llamadas pasan por `HttpF1Repository`:

- Espera hasta 70 segundos cada respuesta.
- Si falla la conexión o la API responde con un error suyo (5xx), lo intenta una vez más. Si el error es del pedido (4xx) o se agotó el tiempo, no reintenta.
- Guarda en memoria cada respuesta buena, sin vencimiento. Las fallidas no se guardan, para poder reintentar.
- Saca los datos del envoltorio `data` y los revisa con Zod. Si vienen vacíos o con otra forma, es un error.
- Si se agota el tiempo, responde `504 UPSTREAM_TIMEOUT`, y ante cualquier otro problema, `502 UPSTREAM_ERROR`. Si una carrera no existe, el servicio responde `404 RACE_NOT_FOUND`; si el piloto no está en la lista de pilotos, `404 DRIVER_NOT_FOUND`.

## Consecuencias

- Solo la primera carga es lenta; después la app responde sin esperar a la API de F1.
- Si los datos de la API de F1 cambiaran, habría que reiniciar el servidor para verlos.
