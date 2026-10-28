# 0003. API con Express separada en capas

## Contexto

La API hace tres cosas distintas: pide datos a la API de F1, revisa lo que le mandan y calcula la simulación. Si todo eso queda mezclado en un mismo archivo, cuesta probar cada parte por separado.

## Decisión

Express 5, con una carpeta por tema (`races`, `drivers`, `simulation`). Dentro de cada una, la ruta recibe el pedido, el controlador lo lee y el servicio hace el trabajo.

La conexión con la API de F1 está escondida detrás de una interfaz, `F1Repository`: los servicios piden "las carreras" sin saber de dónde salen. El cálculo de la simulación son funciones que solo reciben datos y devuelven un resultado, sin red ni Express. El servicio junta los datos; el motor hace la cuenta.

## Consecuencias

- El cálculo se prueba directo, con números, sin levantar un servidor.
- En los tests, la API de F1 se reemplaza por datos falsos sin tocar los servicios.
- Hay más archivos que si todo estuviera en uno, pero cada uno tiene un trabajo claro.
