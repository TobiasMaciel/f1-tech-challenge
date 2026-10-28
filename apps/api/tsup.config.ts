import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  // the shared package ships TypeScript source, so it must be bundled
  noExternal: ['@f1/shared'],
  // The build is what `npm start` runs: inlining production keeps pino-pretty, a dev dependency, out of it.
  env: { NODE_ENV: 'production' },
});
