# API

Backend for Frontend: cada endpoint devuelve lo que necesita una pantalla, combinando los datos de la API F1. El frontend nunca llama a la API F1 directamente.

- Las respuestas exitosas devuelven el recurso sin envoltorio.
- Los tiempos se expresan en segundos (`number`, redondeados a 3 decimales); el formato visual lo decide el frontend.

Para probarlos, abrí la carpeta [`bruno/`](../bruno/) en Bruno y elegí el entorno `local`. También corre desde la terminal: `cd bruno && npx @usebruno/cli run --env local -r`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/races` | Carreras para el selector |
| GET | `/api/races/:raceId` | Carrera con circuito, clima, parámetros y neumáticos |
| GET | `/api/drivers` | Pilotos con su equipo |
| POST | `/api/simulations` | Simula una estrategia |
| GET | `/api/health` | Estado del servicio |

### `GET /api/races`

```json
{
  "races": [
    {
      "id": "race-01",
      "name": "Bahrain Grand Prix",
      "round": 1,
      "date": "2025-04-13",
      "laps": 57,
      "rainProbability": 0.02,
      "circuit": { "id": "circuit-01", "name": "Bahrain International Circuit", "country": "Bahrain" }
    }
  ]
}
```

### `GET /api/races/:raceId`

```json
{
  "race": {
    "id": "race-01", "name": "Bahrain Grand Prix", "round": 1, "date": "2025-04-13",
    "laps": 57, "temperature": 31, "rainProbability": 0.02
  },
  "circuit": {
    "id": "circuit-01", "name": "Bahrain International Circuit", "country": "Bahrain",
    "type": "permanent", "lengthKm": 5.412, "baseLapTime": 91.5, "tyreWear": 1.35,
    "overtakingDifficulty": 0.3
  },
  "weather": {
    "summary": "Very hot and completely dry. High thermal tyre stress.",
    "forecast": [{ "fromLap": 1, "toLap": 19, "temperature": 32, "rainIntensity": 0 }]
  },
  "simulationParameters": {
    "lapTimeVariance": 0.15, "pitStopLoss": 22, "tyreChangeTime": 2.5,
    "fuelEffectPerLap": 0.037, "safetyCarProbability": 0.2, "minimumPitStops": 1
  },
  "tyres": [
    {
      "compound": "SOFT", "pace": -1, "degradation": 0.09, "wetPerformance": 0.1,
      "optimalRainIntensity": { "min": 0, "max": 0.05 }
    }
  ]
}
```

### `GET /api/drivers`

```json
{
  "drivers": [
    {
      "id": "driver-01", "name": "Lando Norris", "number": 4, "pace": 0.98, "consistency": 0.94,
      "team": { "id": "team-01", "name": "McLaren", "carPerformance": 0.99 }
    }
  ]
}
```

### `POST /api/simulations`

Request:

```json
{
  "raceId": "race-01",
  "driverId": "driver-01",
  "stints": [
    { "compound": "SOFT", "laps": 20 },
    { "compound": "HARD", "laps": 37 }
  ]
}
```

`compound`: `SOFT | MEDIUM | HARD | INTERMEDIATE | WET`. `laps`: entero positivo.

Response `200`:

```json
{
  "totalTime": 5289.239,
  "stints": [
    {
      "number": 1, "compound": "SOFT", "startLap": 1, "endLap": 20, "laps": 20,
      "time": 1853.505, "averageLapTime": 92.675, "degradationLoss": 23.085, "weatherLoss": 0
    },
    {
      "number": 2, "compound": "HARD", "startLap": 21, "endLap": 57, "laps": 37,
      "time": 3411.234, "averageLapTime": 92.196, "degradationLoss": 26.973, "weatherLoss": 0
    }
  ],
  "pitStops": [
    { "afterLap": 20, "fromCompound": "SOFT", "toCompound": "HARD", "timeLost": 24.5 }
  ],
  "laps": [
    {
      "lap": 1, "stint": 1, "compound": "SOFT", "tyreAge": 0, "rainIntensity": 0, "time": 91.873,
      "breakdown": {
        "base": 91.5, "package": 1.373, "tyrePace": -1, "degradation": 0, "fuel": 0, "weather": 0
      }
    }
  ]
}
```

- `stints[].degradationLoss` y `stints[].weatherLoss`: segundos perdidos en el stint por desgaste y por lluvia.
- `laps[].breakdown`: aporte de cada término del [modelo](simulation-model.md) al tiempo de la vuelta. `laps` incluye todas las vueltas de la carrera.

Devuelve `200` y no `201` porque la simulación no crea ningún recurso.

### `GET /api/health`

```json
{ "status": "ok" }
```

## Errores

Todos los errores comparten el mismo formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La solicitud no es válida.",
    "details": [{ "path": "stints.0.laps", "message": "Debe ser un número entero positivo." }]
  }
}
```

`details` solo está presente en `VALIDATION_ERROR` y `INVALID_STRATEGY`. En `INVALID_STRATEGY` lista cada regla incumplida (`path: "stints"`) y `message` repite la primera.

| HTTP | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | El body o un parámetro no tiene la forma esperada (por ejemplo, `raceId` con caracteres fuera de `a-z`, `0-9` y `-`) |
| 413 | `PAYLOAD_TOO_LARGE` | El body supera el límite de 100 kb |
| 422 | `INVALID_STRATEGY` | La estrategia es válida en forma pero incumple las reglas de la carrera |
| 404 | `NOT_FOUND` | La ruta no existe |
| 404 | `RACE_NOT_FOUND` | La carrera no existe |
| 404 | `DRIVER_NOT_FOUND` | El piloto no existe |
| 502 | `UPSTREAM_ERROR` | La API F1 respondió con error o con datos inválidos o vacíos |
| 504 | `UPSTREAM_TIMEOUT` | La API F1 no respondió a tiempo |
| 500 | `INTERNAL_ERROR` | Error inesperado |
