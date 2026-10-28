# 01: Base del monorepo

**Qué construir:** el proyecto se levanta desde un checkout limpio con `npm install` y `npm run dev`: el backend responde `GET /api/health` y el frontend muestra una página vacía con el tema oscuro, llamando al backend a través del proxy de Vite. Ver [spec](../spec.md), sección "Estructura".

**Depende de:** ninguno

- [x] npm workspaces con aplicación web, aplicación API y paquete compartido; Node 24 fijado en `.nvmrc` y `engines`
- [x] TypeScript configurado en los tres paquetes; el paquete compartido se importa desde web y API
- [x] Express 5 con `GET /api/health` → `{ "status": "ok" }`, logs con pino y manejador de errores con el formato único `{ error: { code, message } }` (500 `INTERNAL_ERROR`)
- [x] Vite + React + Tailwind + shadcn/ui inicializado, tema oscuro, TanStack Query configurado
- [x] Proxy de Vite de `/api` al backend; `npm run dev` levanta ambos con concurrently
- [x] `.env.example` con `F1_API_BASE_URL` y `PORT`, ambos con valores por defecto en el código
- [x] ESLint + Prettier configurados; `npm run lint` y `npm test` (Vitest) funcionan desde la raíz
- [x] Test de integración: `GET /api/health` responde 200
