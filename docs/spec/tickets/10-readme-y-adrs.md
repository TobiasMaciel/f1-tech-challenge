# 10: README y ADRs

**Qué construir:** el evaluador puede correr el proyecto y entender sus decisiones leyendo el repositorio. Ver [spec](../spec.md): historias 30-32.

**Depende de:** 09

- [x] README de alrededor de media página: requisitos (Node 24), cómo correrlo, supuestos de la simulación, qué se mejoraría con más tiempo, atribución de trazados y banderas
- [x] ADRs breves en `docs/adr/` (contexto, decisión, consecuencias) de las decisiones principales: monorepo TypeScript, React + Vite, Express con arquitectura por módulos y repository, BFF, Zod compartido, sin base de datos, simulación determinista y modelo, estrategia de testing
- [x] Enlaces a `docs/simulation-model.md` y `docs/api.md`, revisados contra el código final
- [x] Verificación desde un checkout limpio: `npm install`, `npm run dev`, `npm test`
