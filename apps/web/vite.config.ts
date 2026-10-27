/// <reference types="vitest/config" />
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const repoRoot = path.resolve(import.meta.dirname, '../..');

export default defineConfig(({ mode }) => {
  // Read the same root .env as the API, so the proxy follows a PORT changed there.
  const env = loadEnv(mode, repoRoot, '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, 'src') },
    },
    server: {
      proxy: { '/api': `http://localhost:${env.PORT ?? 3000}` },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
    },
  };
});
