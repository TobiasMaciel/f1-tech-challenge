# 0002. React con Vite en lugar de Next.js

## Contexto

La app es una herramienta: eliges, armas y simulas. No tiene páginas que Google tenga que indexar ni contenido que convenga generar en el servidor, que es lo fuerte de Next.js.

## Decisión

Una aplicación de una sola página con React y Vite. TanStack Query trae y guarda los datos de la API, y Tailwind con shadcn/ui resuelven los estilos y componentes. La API es un servidor aparte (ADR 0003); en desarrollo, Vite le reenvía las llamadas a `/api`.

## Consecuencias

- Cada parte hace una cosa: la web muestra y la API calcula.
- En desarrollo corren dos procesos, que `npm run dev` levanta juntos.
