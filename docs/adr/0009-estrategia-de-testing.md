# 0009. Qué se prueba y cómo

## Contexto

Donde más fácil es equivocarse es en la cuenta de la simulación y en la conexión con una API externa lenta. Los tests no pueden depender de esa API.

## Decisión

Vitest en las tres partes, probando lo que cada parte hace hacia afuera y no cómo lo hace por dentro.

- **Cálculo de la simulación:** se escribió con TDD, test primero, con tiempos esperados exactos.
- **API:** tests que le hacen pedidos reales a la app con Supertest, mientras MSW se hace pasar por la API de F1.
- **Web:** tests con React Testing Library que buscan lo que ve el usuario, también con MSW.
- Sin tests de punta a punta en un navegador.

## Consecuencias

- Los tests son rápidos, dan siempre lo mismo y no necesitan internet.
- No se prueba la app en un navegador real; agregar Playwright queda como mejora.
