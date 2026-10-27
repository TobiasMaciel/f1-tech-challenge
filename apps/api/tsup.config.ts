import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  // the shared package ships TypeScript source, so it must be bundled
  noExternal: ['@f1/shared'],
});
