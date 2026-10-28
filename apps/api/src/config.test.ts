import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('usa el puerto 3000 y la API de F1 por defecto', () => {
    expect(loadConfig({})).toEqual({
      port: 3000,
      f1ApiBaseUrl: 'https://tech-challenge101.onrender.com',
    });
  });

  it('falla al arrancar si PORT no es un puerto válido', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(/PORT/);
  });

  it('falla al arrancar si F1_API_BASE_URL no es una URL', () => {
    expect(() => loadConfig({ F1_API_BASE_URL: 'not-a-url' })).toThrow(/F1_API_BASE_URL/);
  });
});
