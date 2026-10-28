# Cómo se trabajó

El proyecto se construyó con *spec-driven development*: primero se escribió qué había que construir y después se construyó siguiendo eso, ticket por ticket. Usé agentes de IA para implementar; las decisiones, la revisión de cada cambio y la integración las hice yo.

## 1. Entender el problema

Lectura del [enunciado](tech-challenge.md) e investigación de la API de F1: qué datos trae, qué significa cada campo y cómo se comporta (se duerme, tarda hasta un minuto y puede fallar).

## 2. Tomar las decisiones

Rondas de preguntas y respuestas para cerrar cada decisión antes de escribir código: stack, arquitectura, modelo de simulación, contrato de la API, pantallas y manejo de errores. Las importantes quedaron en los [ADR](adr/README.md); el modelo, en [`simulation-model.md`](simulation-model.md); el contrato, en [`api.md`](api.md).

## 3. Escribir la especificación

La [especificación](spec/spec.md) describe el problema, la solución, 36 historias de usuario, las decisiones de implementación, qué se prueba y qué queda fuera de alcance.

## 4. Dividir en tickets

Trece tickets verticales: cada uno es una porción que funciona de punta a punta (de la API a la pantalla), con sus criterios de aceptación y de qué tickets depende.

| # | Ticket | Depende de |
|---|---|---|
| [01](spec/tickets/01-base-del-monorepo.md) | Base del monorepo | ninguno |
| [02](spec/tickets/02-trazados-de-circuitos.md) | Trazados de circuitos | 01 |
| [03](spec/tickets/03-elegir-carrera.md) | Elegir carrera | 01, 02 |
| [04](spec/tickets/04-informacion-de-la-carrera.md) | Información de la carrera | 03 |
| [05](spec/tickets/05-elegir-piloto.md) | Elegir piloto | 03 |
| [06](spec/tickets/06-simulacion-minima.md) | Simulación mínima de punta a punta | 04, 05 |
| [07](spec/tickets/07-modelo-completo.md) | Modelo completo | 06 |
| [08](spec/tickets/08-resultado-visual.md) | Resultado visual | 07 |
| [09](spec/tickets/09-pulido-y-responsive.md) | Pulido y responsive | 08 |
| [10](spec/tickets/10-readme-y-adrs.md) | README y ADRs | 09 |
| [11](spec/tickets/11-ayudas-para-entender.md) | Ayudas para entender la estrategia y el resultado | 10 |
| [12](spec/tickets/12-animaciones.md) | Animaciones con propósito | 11 |
| [13](spec/tickets/13-comparar-con-la-anterior.md) | Comparar con la simulación anterior | 12 |

## 5. Implementar

Cada ticket lo implementó un agente de IA en su propia rama, siguiendo la especificación y con TDD en el motor de simulación. Antes de integrarla revisé cada rama y corrí lint, tipos y tests. La integración fue con rebase, para mantener un historial lineal.

## 6. Revisar

Al final, una revisión de todo el código en dos ejes (si cumple la especificación y si sigue las convenciones del proyecto) y una prueba manual como usuario, con casos borde y fallas de la API simuladas. Lo que apareció se corrigió en los últimos commits.
