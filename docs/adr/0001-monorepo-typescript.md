# 0001. Monorepo TypeScript con npm workspaces

## Contexto

Frontend y backend comparten el contrato de la API (request, response y reglas de validación). Mantenerlos en repositorios o paquetes sin relación obliga a duplicar tipos y deja que se desincronicen.

## Decisión

Un solo repositorio con npm workspaces: `apps/web`, `apps/api` y `packages/shared`. Todo en TypeScript, Node 24. Un único `npm install` y scripts raíz (`dev`, `test`, `lint`, `typecheck`, `build`) que recorren los workspaces.

## Consecuencias

- (+) El contrato se define una vez y los dos lados lo importan; un cambio incompatible rompe el `typecheck`.
- (+) Un solo comando para instalar, correr y verificar.
- (−) `packages/shared` se consume desde su código fuente, por lo que ambas apps deben poder compilar TypeScript.
- (−) Sin herramientas de monorepo (Turborepo, Nx) no hay caché de tareas; con este tamaño no hace falta.
