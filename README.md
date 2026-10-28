# F1 Race Strategist

Aplicación web para armar una estrategia de neumáticos y simular el tiempo total de una carrera de F1 con los datos de la API del challenge.

## Requisitos

Node 24 y npm.

## Cómo correrlo

```bash
npm install
npm run dev
```

- Web: http://localhost:5173 (si el puerto está ocupado, Vite usa el siguiente y lo imprime).
- API: http://localhost:3000, expuesta también en la web bajo `/api` mediante el proxy de Vite.

Variables de entorno (opcionales, ver `.env.example`):

| Variable          | Default                                  |
| ----------------- | ---------------------------------------- |
| `PORT`            | `3000`                                   |
| `F1_API_BASE_URL` | `https://tech-challenge101.onrender.com` |

Si el puerto 3000 está ocupado, usa otro (`PORT=3100 npm run dev` o `PORT` en `.env`): la API y el proxy de Vite lo leen de ahí.

La API externa se duerme por inactividad: la primera carga puede tardar hasta un minuto.

## Scripts

`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.

## Estructura

- `apps/web`: SPA con React, Vite, TanStack Query, Tailwind y shadcn/ui.
- `apps/api`: backend Express 5 que adapta la API F1 a lo que necesita cada pantalla.
- `packages/shared`: esquemas Zod y tipos compartidos entre ambos.
- `bruno`: colección de [Bruno](https://www.usebruno.com/) con un request por endpoint, los errores de negocio y la API F1 original.

Contrato HTTP en [`docs/api.md`](docs/api.md) y decisiones de arquitectura en [`docs/adr/`](docs/adr/).

## Supuestos de la simulación

- La simulación es determinista: sin variabilidad aleatoria ni safety car.
- El rendimiento del piloto y del auto se promedia y se aplica como porcentaje sobre el tiempo base de la vuelta.
- La degradación del neumático es lineal en la edad del juego.
- La lluvia penaliza según la distancia entre su intensidad y la banda óptima del compuesto.
- La temperatura, la consistencia y la dificultad de adelantamiento se muestran pero no entran al modelo.

Detalle y fórmulas en [`docs/simulation-model.md`](docs/simulation-model.md).

## Qué mejoraría con más tiempo

- Calcular la estrategia óptima.
- Repetición animada de la carrera.
- Tests end-to-end con Playwright.
- Especificación OpenAPI propia.
- Persistir estrategias con una base relacional.
- Docker y deploy.

## Créditos

- Trazados de circuitos: [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) (MIT, Tomislav Bacinger).
- Banderas: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
