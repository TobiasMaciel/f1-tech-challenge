# 0002. React + Vite (SPA) en lugar de Next.js

## Contexto

El challenge pide un frontend y un backend. La interfaz es una herramienta interactiva sin contenido público que indexar: no necesita SEO ni renderizado en servidor.

## Decisión

SPA con React y Vite, TanStack Query para el estado del servidor, Tailwind y shadcn/ui. El backend es un servicio aparte (ADR 0003) y Vite redirige `/api` a él en desarrollo.

## Consecuencias

- (+) Dos piezas con responsabilidades claras: la SPA presenta, la API calcula.
- (+) Arranque y pruebas rápidas con Vite y Vitest.
- (−) Dos procesos en desarrollo (`concurrently`) y proxy de `/api`.
- (−) Sin renderizado en servidor; no se necesita para este caso de uso.
