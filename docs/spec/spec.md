# Especificación: F1 Race Strategist

Fuentes: enunciado en [`tech-challenge.md`](../tech-challenge.md), modelo en [`simulation-model.md`](../simulation-model.md), contrato en [`api.md`](../api.md) y decisiones en [`adr/`](../adr/README.md).

## Problema

Un usuario quiere planificar la estrategia de neumáticos de una carrera de F1 y entender cómo le iría. Para eso necesita ver los datos relevantes de la carrera (circuito, clima por tramos, neumáticos, piloto), probar combinaciones de compuestos y paradas, y recibir un resultado que explique **por qué** una estrategia es buena o mala, no solo un tiempo total. Los datos vienen de una API externa que puede tardar hasta un minuto en despertar, fallar o devolver datos vacíos.

## Solución

Una aplicación web de una sola página con frontend (React) y backend (Express) en un monorepo TypeScript. El backend actúa como Backend for Frontend: consume la API F1, combina sus datos por pantalla, valida la estrategia y ejecuta una simulación determinista vuelta por vuelta. El frontend permite elegir carrera y piloto, ver toda la información de la carrera, armar los stints con una barra alineada al pronóstico de lluvia, simular y leer el resultado en tres niveles: total, desglose por stint y paradas, y detalle por vuelta con gráfico.

## Historias de usuario

1. Como usuario, quiero ver las 7 carreras disponibles como tarjetas, para elegir una rápidamente.
2. Como usuario, quiero ver en cada tarjeta la ronda, el nombre, la cantidad de vueltas y la probabilidad de lluvia, para anticipar el tipo de estrategia antes de elegir.
3. Como usuario, quiero ver el trazado real del circuito en cada tarjeta, para reconocer la pista.
4. Como usuario, quiero ver la bandera del país de cada carrera, para identificarla de un vistazo.
5. Como usuario, quiero que al elegir una carrera se muestre su información, para planificar con datos.
6. Como usuario, quiero ver el tipo de circuito, su largo, vueltas, vuelta base, nivel de desgaste, dificultad de adelantamiento y pérdida en boxes, para entender qué hace distinto a este circuito.
7. Como usuario, quiero leer el resumen del clima de la carrera, para entender las condiciones esperadas.
8. Como usuario, quiero ver una barra de vueltas dividida en tramos y coloreada según la intensidad de lluvia, con la temperatura de cada tramo, para saber cuándo llueve.
9. Como usuario, quiero ver el ritmo, la degradación, el rendimiento en mojado y la banda de lluvia óptima de cada compuesto, para elegir gomas con criterio.
10. Como usuario, quiero ver la probabilidad de safety car y la variabilidad por vuelta, para conocer los riesgos de la carrera.
11. Como usuario, quiero elegir un piloto de una lista agrupada por equipo, para simular con su rendimiento.
12. Como usuario, quiero ver el ritmo, la consistencia, el número y el equipo del piloto elegido, para saber con quién corro.
13. Como usuario, quiero agregar stints indicando compuesto y cantidad de vueltas, para armar mi estrategia.
14. Como usuario, quiero quitar stints, para corregir la estrategia.
15. Como usuario, quiero ver un contador de vueltas asignadas sobre el total de la carrera, para saber si mi estrategia cubre toda la carrera.
16. Como usuario, quiero que el formulario me avise mientras escribo si la estrategia es inválida, para corregirla antes de simular.
17. Como usuario, quiero ver una barra de mis stints alineada vuelta a vuelta con la barra del clima, para detectar si voy con gomas secas bajo la lluvia.
18. Como usuario, quiero ver en qué vuelta cae cada parada, para entender mi plan de boxes.
19. Como usuario, quiero simular la estrategia con un botón, para obtener el resultado.
20. Como usuario, quiero ver el tiempo total estimado en formato de carrera (h:mm:ss.mmm), para conocer el resultado principal.
21. Como usuario, quiero ver cuánto tiempo sumó o restó cada factor en toda la carrera (desgaste, lluvia, boxes, combustible), para entender dónde se fue el tiempo.
22. Como usuario, quiero ver una tabla con cada stint (compuesto, vueltas desde-hasta, tiempo, promedio por vuelta, pérdida por desgaste y por lluvia), para leer el desglose.
23. Como usuario, quiero ver cada parada con la vuelta, el cambio de compuesto y el tiempo perdido, para evaluar el costo de parar.
24. Como usuario, quiero ver un gráfico del tiempo por vuelta coloreado por compuesto y con el fondo sombreado donde llueve, para ver cómo evoluciona la carrera.
25. Como usuario, quiero modificar la estrategia y volver a simular sin perder el contexto, para probar alternativas.
26. Como usuario, quiero ver "Cargando datos…" cuando la carga demora, para saber que la app sigue funcionando.
27. Como usuario, quiero ver un aviso con un botón "Reintentar" cuando el proveedor de datos falla o no responde, para poder recuperarme sin recargar.
28. Como usuario, quiero ver junto al formulario el motivo por el que mi estrategia es inválida, para corregirla.
29. Como usuario, quiero usar la app desde el celular, para consultarla en cualquier lugar.
30. Como evaluador, quiero levantar el proyecto con `npm install` y `npm run dev`, para probarlo sin configuración.
31. Como evaluador, quiero leer en el README cómo correrlo, los supuestos de la simulación y qué se mejoraría, para entender las decisiones.
32. Como evaluador, quiero leer ADRs breves de las decisiones principales, para entender el razonamiento.
33. Como desarrollador del frontend, quiero un endpoint por pantalla, para no conocer ni combinar la API externa.
34. Como desarrollador del frontend, quiero que todos los errores tengan el mismo formato, para mostrarlos sin casos especiales.
35. Como operador, quiero un endpoint de salud, para saber si el backend está vivo.
36. Como operador, quiero logs estructurados de cada request y de cada llamada al proveedor, para diagnosticar fallas.

## Decisiones de implementación

### Estructura

- Monorepo con npm workspaces: aplicación web, aplicación API y un paquete compartido. Node 24 LTS. TypeScript en todo.
- `npm run dev` en la raíz levanta ambas aplicaciones con concurrently. El servidor de desarrollo de Vite reenvía `/api` al backend (sin CORS).
- Variables de entorno con valores por defecto (`F1_API_BASE_URL`, `PORT`) documentadas en `.env.example`.
- ESLint + Prettier.

### Paquete compartido

- Schemas Zod y tipos inferidos del request de simulación (`raceId`, `driverId`, `stints[]` con `compound` y `laps`) y de las respuestas de la API propia. Lo usan el backend para validar el body y el frontend para validar el formulario.

### Backend (Express 5)

- Organización por módulos (`races`, `drivers`, `simulation`) con capas routes → controller → service.
- **Patrón Repository:** una interfaz `F1Repository` con un método por recurso de la API F1 (carreras, carrera, clima, parámetros de simulación, neumáticos, pilotos, equipos, circuitos). La implementación HTTP:
  - quita el envoltorio `{ statusCode, code, message, data }`;
  - valida cada respuesta con Zod (respuesta inválida o vacía → error de proveedor);
  - aplica timeout y un reintento (cold start de hasta 60 s);
  - cachea en memoria sin vencimiento (los datos son deterministas);
  - traduce 404 de la API F1 a "no encontrado" y el resto de las fallas a errores de proveedor.
- **Regla:** el service orquesta (pide datos al repository y llama al motor); el motor decide (toda regla y cálculo).
- **Motor de simulación:** funciones puras, sin dependencias de Express ni de red. Punto de entrada único que recibe los datos de la carrera, el piloto con su equipo, los neumáticos y la estrategia, y devuelve el resultado o los motivos de invalidez.
- **Modelo** (detalle en `docs/simulation-model.md`): tiempo de vuelta = vuelta base + ajuste piloto/auto + ritmo del compuesto + degradación − combustible + penalización por lluvia; más `pitStopLoss + tyreChangeTime` por parada. Determinista. Consistencia, variabilidad, temperatura, safety car y dificultad de adelantamiento solo se muestran.
- **Validación en dos niveles:** forma con Zod en el controller (400 `VALIDATION_ERROR`); reglas de carrera en el motor (422 `INVALID_STRATEGY`): suma de vueltas igual a `race.laps`, cada stint con al menos una vuelta, paradas ≥ `minimumPitStops`.
- **Fuentes de datos duplicados:** vueltas desde `race.laps`; pérdida en boxes desde `simulation-parameters`.
- **Contrato** (detalle en `docs/api.md`): `GET /api/races`, `GET /api/races/:raceId`, `GET /api/drivers`, `POST /api/simulations` (200), `GET /api/health`. Respuestas sin envoltorio; tiempos en segundos.
- **Resultado de la simulación:** `totalTime`; `stints[]` con número, compuesto, vuelta inicial y final, vueltas, tiempo, promedio, pérdida por degradación y por lluvia; `pitStops[]` con vuelta, compuesto saliente y entrante, tiempo perdido; `laps[]` con vuelta, stint, compuesto, edad de la goma, lluvia, tiempo y aporte de cada término.
- **Errores:** formato único `{ error: { code, message, details? } }`. 400 `VALIDATION_ERROR`, 422 `INVALID_STRATEGY`, 404 `RACE_NOT_FOUND` / `DRIVER_NOT_FOUND`, 502 `UPSTREAM_ERROR`, 504 `UPSTREAM_TIMEOUT`, 500 `INTERNAL_ERROR`. Mensajes en español.
- Logs estructurados con pino.

### Frontend (React + Vite)

- Arquitectura por features: selección de carrera, información de la carrera, constructor de estrategia, resultado. Componentes genéricos de shadcn/ui aparte. Container/presentational dentro de cada feature. Una feature no importa de otra.
- TanStack Query para las llamadas al backend.
- Una sola página con cuatro secciones verticales. Se evaluará pasar a dos columnas en escritorio después de probarla.
- Tailwind CSS + shadcn/ui, tema oscuro único, colores oficiales de compuestos (SOFT rojo, MEDIUM amarillo, HARD blanco, INTERMEDIATE verde, WET azul), íconos de compuesto con CSS, íconos lucide, sin emojis. Responsive.
- Recharts para el gráfico por vuelta.
- Trazados de circuitos: SVG generados una sola vez desde el dataset abierto bacinger/f1-circuits (MIT) mediante un script versionado; tabla propia de correspondencia circuito → trazado; si falta un trazado, la tarjeta se muestra sin dibujo. Atribución en el README.
- Banderas con flag-icons.
- Tiempos formateados en el frontend; el frontend no calcula nada del modelo.
- Estados: "Cargando datos…" si la carga supera 3 s; errores de proveedor con botón "Reintentar"; errores de estrategia junto al formulario.

### Convenciones

- Código y comentarios en inglés; UI, README, ADRs y commits en español.
- TSDoc breve en lo exportado; comentarios en línea solo para el porqué.

## Testing

- Un buen test verifica **comportamiento externo** a través de una interfaz pública, nunca detalles de implementación. Estructura AAA, un comportamiento por test, nombre en español como frase.
- TDD (rojo → verde → refactor) para el motor de simulación.
- Solo los tests necesarios. Fixtures construidos a partir de datos reales de la API F1.
- **Puntos de prueba (tres):**
  1. **Motor de simulación**, a través de su punto de entrada único (unitarios, Vitest): cada término del modelo, las pérdidas por stint, las paradas y las reglas de validación.
  2. **API HTTP del backend**, con Supertest y la API F1 simulada en la red con MSW: respuesta exitosa de cada endpoint, 400, 422, 404, 502 (proveedor con error o respuesta vacía/inválida) y 504.
  3. **Aplicación web**, con React Testing Library y el backend simulado con MSW: el flujo principal de armar stints y simular, y el aviso de error con reintento.
- Sin tests end-to-end en navegador en esta versión.

## Fuera de alcance

- Estrategia óptima y repetición animada de la carrera. La comparación con la simulación anterior también quedó afuera de esta versión y se sumó después, en el ticket 13.
- Base de datos y persistencia de estrategias.
- Docker y deploy.
- Tests end-to-end (Playwright).
- Swagger propio de la API.
- Aleatoriedad en la simulación, efecto de la temperatura, safety car y rivales en el cálculo.
- Regla de dos compuestos secos distintos.

## Notas

- La API F1 incluye `/api/tyres`, que no figura en el enunciado.
