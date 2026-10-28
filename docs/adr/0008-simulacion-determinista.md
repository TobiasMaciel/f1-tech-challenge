# 0008. Simulación sin azar

## Contexto

La API trae datos que describen azar: cuánto varía cada vuelta (`lapTimeVariance`), la constancia del piloto (`consistency`) y la probabilidad de safety car. Si la simulación los usara, la misma estrategia daría un tiempo distinto cada vez y no se podrían comparar dos estrategias ni comprobar la cuenta.

## Decisión

La simulación calcula vuelta por vuelta y la misma estrategia da siempre el mismo tiempo. Cada vuelta suma: el tiempo base del circuito, el rendimiento del piloto y del auto, el ritmo del neumático, su desgaste, el combustible que se va gastando y la penalización por lluvia si el neumático no es el adecuado. A eso se suman las paradas en boxes.

`consistency`, `lapTimeVariance`, la temperatura, el safety car y la dificultad de adelantamiento se muestran en pantalla pero no entran en la cuenta. Las fórmulas están en `docs/simulation-model.md`.

## Consecuencias

- El resultado se puede comprobar a mano, y los tests usan tiempos exactos.
- Cada vuelta devuelve cuánto aportó cada factor, y eso es lo que la pantalla usa para explicar dónde se fue el tiempo.
- Es una simplificación: no hay accidentes, tráfico ni efecto de la temperatura. Cómo se usan el rendimiento y la lluvia es una interpretación propia de los datos, explicada como supuesto.
