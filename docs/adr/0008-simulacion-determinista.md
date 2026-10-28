# 0008. Simulación determinista y datos del modelo

## Contexto

La API describe variabilidad (`lapTimeVariance`, `consistency`), riesgo de safety car y dificultad de adelantamiento. Un resultado con azar impide verificar el cálculo y comparar estrategias: la misma entrada daría tiempos distintos.

## Decisión

La simulación es una función pura vuelta por vuelta: la misma estrategia produce siempre el mismo tiempo. El tiempo de vuelta suma base, rendimiento de piloto y auto, ritmo del compuesto, degradación lineal, combustible y penalización por lluvia fuera de la banda óptima del compuesto. Se suman las paradas (`pitStopLoss + tyreChangeTime`). Cada término se devuelve desglosado por vuelta.

Quedan fuera del modelo: `consistency`, `lapTimeVariance`, temperatura, `safetyCarProbability` y `overtakingDifficulty`; se muestran sin simular. Fórmulas y supuestos en `docs/simulation-model.md`.

## Consecuencias

- (+) Resultados reproducibles y comprobables con tests de ejemplo.
- (+) El desglose por término permite explicar cada tiempo en la interfaz.
- (−) Es una simplificación: no hay incidentes, tráfico ni efecto de la temperatura sobre la goma.
- (−) La fórmula de rendimiento y la de lluvia son interpretaciones de los datos, documentadas como supuestos.
