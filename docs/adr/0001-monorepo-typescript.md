# 0001. Un solo repositorio para web, API y código compartido

## Contexto

La web y la API se tienen que poner de acuerdo en qué se manda y qué se responde. Si cada una vive en su propio proyecto, ese acuerdo se escribe dos veces y tarde o temprano deja de coincidir.

## Decisión

Un solo repositorio con tres partes: `apps/web`, `apps/api` y `packages/shared`, donde está lo que usan las dos. Todo en TypeScript y Node 24, usando los workspaces de npm. Un `npm install` instala todo y los scripts de la raíz (`dev`, `test`, `lint`, `typecheck`, `build`) corren en las tres partes.

## Consecuencias

- Si la API cambia lo que responde y la web no se actualiza, `npm run typecheck` falla: el error aparece antes de llegar al navegador.
- Se instala, se corre y se prueba con un solo comando.
- Para un proyecto de este tamaño no hacen falta herramientas extra de monorepos como Turborepo o Nx.
