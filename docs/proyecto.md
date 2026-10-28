# El proyecto en detalle

## Qué hace

La pantalla se recorre de arriba hacia abajo, en cuatro pasos:

1. **Elige una carrera.** Una tarjeta por carrera, con el trazado del circuito, la bandera, las vueltas y la probabilidad de lluvia.
2. **La carrera.** El circuito (largo, tiempo base de vuelta, desgaste, pérdida en boxes), el clima por tramos de vueltas, los neumáticos disponibles y los riesgos (safety car y variación por vuelta).
3. **Arma tu estrategia.** Eliges un piloto y divides la carrera en stints: cada uno es un neumático y una cantidad de vueltas. Una barra alinea tus stints con el clima y avisa si un neumático no sirve para la lluvia de ese tramo. El botón **Simular** explica por qué todavía no se puede simular, si falta algo.
4. **Resultado.** El tiempo total, una frase con la mayor pérdida, cuánto sumó o restó cada factor, la tabla de stints, las paradas y un gráfico con el tiempo de cada vuelta. Si vuelves a simular la misma carrera, muestra la diferencia con la simulación anterior.

## Cómo levantarlo

Requisitos: Node.js 24 y npm. Con nvm, `nvm use` elige la versión de `.nvmrc`.

```bash
npm install
npm run dev
```

- Web: http://localhost:5173. Si el puerto está ocupado, Vite usa el siguiente y lo muestra en la terminal.
- API: http://localhost:3000. En desarrollo, la web le reenvía las llamadas a `/api`.

La configuración es opcional. Para cambiarla, copia `.env.example` como `.env`:

| Variable          | Para qué                     | Por defecto                              |
| ----------------- | ---------------------------- | ---------------------------------------- |
| `PORT`            | Puerto de la API             | `3000`                                   |
| `F1_API_BASE_URL` | Dirección de la API de F1    | `https://tech-challenge101.onrender.com` |

Si el puerto 3000 está ocupado, la API no arranca y la web muestra "Ocurrió un error". Cambiar `PORT` en `.env` alcanza: la web lee el mismo valor.

## Comandos

| Comando             | Qué hace                                           |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Levanta la web y la API juntas                     |
| `npm test`          | Corre los tests de las tres partes                 |
| `npm run lint`      | Revisa el estilo del código                        |
| `npm run typecheck` | Revisa los tipos de TypeScript                     |
| `npm run build`     | Genera la versión de producción de la web y la API |
| `npm run format`    | Formatea el código con Prettier                    |

## Cómo está organizado

```
apps/web          La página (React + Vite)
  src/features    Una carpeta por paso de la pantalla
  src/components  Piezas que usan varios pasos
  src/hooks       Pedidos a la API y otros hooks compartidos
  src/lib         Formatos, colores de neumáticos, cliente HTTP
apps/api          Nuestra API (Node + Express)
  src/races       Endpoints de carreras
  src/drivers     Endpoint de pilotos
  src/simulation  Endpoint de simulación y el motor de cálculo (engine/)
  src/f1          Conexión con la API de F1
packages/shared   Tipos y reglas que usan la web y la API
bruno             Pedidos de ejemplo para probar la API
docs              Contrato de la API, modelo de simulación y decisiones
```

### Cómo viajan los datos

```
Navegador ──► nuestra API (/api/...) ──► API de F1
```

La web nunca llama a la API de F1. Cada endpoint de nuestra API pide lo que necesita, lo combina y devuelve a cada pantalla exactamente lo que muestra:

| Endpoint                   | Para qué                                                | Usa de la API de F1                            |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `GET /api/races`           | Las tarjetas de carreras                                | `/races` y `/circuits`                         |
| `GET /api/races/:raceId`   | Circuito, clima, parámetros y neumáticos de una carrera | `/races/:id`, `/weather`, `/simulation-parameters` y `/tyres` |
| `GET /api/drivers`         | El selector de pilotos                                  | `/drivers` y `/teams`                          |
| `POST /api/simulations`    | Simular una estrategia                                  | Los anteriores que necesita                    |
| `GET /api/health`          | Saber si la API está viva                               | Nada                                           |

Las respuestas de la API de F1 se guardan en memoria, así que solo la primera carga es lenta. El detalle de cada endpoint, con ejemplos y errores, está en [`api.md`](api.md).

## Probar la API

- **Con Bruno:** abre la carpeta `bruno/` en [Bruno](https://www.usebruno.com/) y elige el entorno `local`. Hay un pedido por endpoint, uno por cada error y otros contra la API de F1 original. Desde la terminal: `cd bruno && npx @usebruno/cli run --env local -r`.
- **Con curl:**

  ```bash
  curl http://localhost:3000/api/races
  curl -X POST http://localhost:3000/api/simulations \
    -H 'Content-Type: application/json' \
    -d '{"raceId":"race-01","driverId":"driver-01","stints":[{"compound":"SOFT","laps":20},{"compound":"HARD","laps":37}]}'
  ```

## Cómo se calcula el tiempo

Cada vuelta suma:

- **Tiempo base** de vuelta del circuito.
- **Piloto y auto:** el promedio del ritmo del piloto y del rendimiento del auto. Con 1, no suma nada; con 0.95, la vuelta tarda un 5 % más.
- **Ritmo del neumático:** los blandos restan tiempo y los de lluvia suman.
- **Desgaste:** crece igual con cada vuelta de uso del neumático y depende de cuánto gasta el circuito.
- **Combustible:** el auto se aliviana y gana un poco de tiempo en cada vuelta.
- **Lluvia:** si la lluvia de esa vuelta está fuera del rango ideal del neumático, pierde tiempo según cuánto se aleja y cuánto agarre tiene en mojado.

A eso se le suma cada parada en boxes: el tiempo de entrar y salir más el del cambio de neumáticos. Las fórmulas exactas, con un ejemplo de vuelta calculado a mano, están en [`simulation-model.md`](simulation-model.md).

Para que una estrategia sea válida, las vueltas de los stints tienen que sumar las de la carrera y tiene que haber al menos las paradas que pide esa carrera.

## Tests

- **Motor de simulación:** tests con tiempos exactos, escritos antes que el código.
- **API:** tests que le hacen pedidos reales a la app; la API de F1 se reemplaza por datos falsos, así que no hace falta internet.
- **Web:** tests que buscan lo que ve el usuario en pantalla.

## Decisiones

Cada decisión importante tiene su explicación corta en [`adr/`](adr/README.md): por qué un solo repositorio, React con Vite, Express separado en capas, la API intermedia, cómo se valida, el caché, por qué no hay base de datos, la simulación sin azar y qué se prueba.

## Qué mejoraría con más tiempo

- **Sugerir la mejor estrategia:** es la pregunta que el usuario intenta responder a mano.
- **Ver la carrera animada:** haría más fácil ver dónde se gana o se pierde tiempo.
- **Tests en un navegador real (Playwright):** hoy la app se prueba por partes.
- **Documentar la API con OpenAPI:** el contrato se podría verificar automáticamente.
- **Guardar estrategias en una base de datos:** para compararlas entre sesiones.
- **Docker y publicarla online:** para probarla sin instalar nada.

## Créditos

- Trazados de circuitos: [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) (MIT, Tomislav Bacinger).
- Banderas: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
