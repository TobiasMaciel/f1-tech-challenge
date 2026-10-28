# 07: Modelo completo

**Qué construir:** la simulación incorpora piloto/auto, combustible y lluvia, y devuelve el aporte de cada término por vuelta y las pérdidas por stint. Ver `docs/simulation-model.md`.

**Depende de:** 06

- [x] Ajuste piloto/auto: `baseLapTime × (1 − (driver.pace + team.carPerformance) / 2)`
- [x] Combustible: `fuelEffectPerLap × (vuelta − 1)` restado
- [x] Lluvia: `baseLapTime × (1 − wetPerformance) × distancia a la banda óptima`, usando el tramo de clima de cada vuelta; 0 dentro de la banda
- [x] Cada vuelta devuelve `breakdown` (base, package, tyrePace, degradation, fuel, weather) y `rainIntensity`
- [x] Cada stint devuelve `degradationLoss` y `weatherLoss`
- [x] Tests unitarios con TDD de cada término; caso Singapur: con lluvia 0.85 WET es más rápido que INTERMEDIATE y SOFT; con 0.45 INTERMEDIATE es más rápido que WET
- [x] Caso de referencia: Bahrain, Norris, SOFT 20 + HARD 37 → total 5289.24 s
