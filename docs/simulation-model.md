# Modelo de simulación

La carrera se simula vuelta por vuelta. El resultado es determinista: la misma estrategia produce siempre el mismo tiempo.

## Tiempo de vuelta

```
lapTime = baseLapTime
        + baseLapTime × (1 − packageRating)
        + tyre.pace
        + tyre.degradation × tyreAge × circuit.tyreWear
        − fuelEffectPerLap × (lap − 1)
        + baseLapTime × (1 − tyre.wetPerformance) × distanceToOptimalRain
```

| Término | Fuente | Tipo |
|---|---|---|
| `baseLapTime` | `circuit.baseLapTime` | Dato |
| `packageRating` | `(driver.pace + team.carPerformance) / 2` | Interpretación |
| `tyre.pace` | `/api/tyres` | Dato |
| Degradación | `tyre.degradation`, `circuit.tyreWear`; `tyreAge` = vueltas completadas con ese juego (0 en la primera) | Dato |
| Combustible | `simulationParameters.fuelEffectPerLap` | Dato |
| Lluvia | `weather.forecast[].rainIntensity`, `tyre.optimalRainIntensity`, `tyre.wetPerformance` | Interpretación |

`distanceToOptimalRain` es cuánto se aleja la intensidad de lluvia de la banda óptima del compuesto (0 si está dentro). La intensidad de cada vuelta sale del tramo del pronóstico que la contiene; fuera de todo tramo es 0.

## Tiempo total

```
totalTime = Σ lapTime + (pitStopLoss + tyreChangeTime) × pitStops
```

`pitStopLoss` y `tyreChangeTime` salen de `simulation-parameters`; la API indica que `pitStopLoss` excluye el cambio de neumáticos. Cada parada ocurre al final de la última vuelta de su stint. Se suma con precisión completa y cada número de la respuesta se redondea a 3 decimales al final.

## Supuestos

- **Rendimiento de piloto y auto:** los puntajes de 0 a 1 se leen como porcentaje de rendimiento sobre `baseLapTime`, con igual peso para piloto y auto.
- **Lluvia:** fuera de su banda óptima, una goma pierde una fracción de `baseLapTime` proporcional al agarre que le falta en mojado y a la distancia a la banda. Dentro de la banda no hay penalización.
- **Degradación lineal**, sin caída abrupta de rendimiento.
- **Fuentes duplicadas:** las vueltas se toman de `race.laps` y la pérdida en boxes de `simulation-parameters` (coinciden con los valores del circuito).

## Datos mostrados pero no simulados

- `consistency` y `lapTimeVariance`: describen variabilidad aleatoria, incompatible con un modelo determinista.
- Temperatura: ningún dato la vincula con el comportamiento de los neumáticos.
- `safetyCarProbability`: se informa como riesgo; un costo esperado no representaría un evento real.
- `overtakingDifficulty`: requiere simular rivales.

## Validación de la estrategia

El motor valida dos reglas de la carrera y la API responde `422 INVALID_STRATEGY` si se incumple alguna:

- La suma de vueltas de los stints es igual a `race.laps`.
- La cantidad de paradas es al menos `minimumPitStops`.

Que cada stint tenga al menos una vuelta es parte de la forma de la solicitud: lo valida el esquema compartido y la API responde `400 VALIDATION_ERROR`.
