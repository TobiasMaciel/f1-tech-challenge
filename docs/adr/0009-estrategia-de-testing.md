# 0009. Estrategia de testing

## Contexto

El mayor riesgo está en el cálculo de la simulación y en la integración con una API externa lenta. Los tests nunca deben depender de ella.

## Decisión

Vitest en todos los workspaces; se prueba comportamiento externo a través de interfaces públicas.

- Motor de simulación: TDD con tests unitarios sobre funciones puras.
- API: tests de integración con Supertest sobre la app, con MSW simulando la API F1.
- Web: React Testing Library con MSW, probando lo que ve el usuario.
- Sin tests end-to-end.

## Consecuencias

- (+) Rápidos, deterministas y sin red.
- (+) El núcleo de lógica tiene la cobertura más fina; los tests de integración cubren el contrato y los errores.
- (−) Sin E2E no se prueba el proxy de Vite ni el navegador real; Playwright queda como mejora.
