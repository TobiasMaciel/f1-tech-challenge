import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int('PORT must be an integer.')
    .min(1, 'PORT must be between 1 and 65535.')
    .max(65535, 'PORT must be between 1 and 65535.')
    .default(3000),
  F1_API_BASE_URL: z
    .url('F1_API_BASE_URL must be a URL.')
    .default('https://tech-challenge101.onrender.com'),
});

/** Reads the server settings from environment variables; an invalid value stops the startup with the reason. */
export function loadConfig(env: Record<string, string | undefined>) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const reasons = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${reasons.join('\n')}`);
  }
  return { port: result.data.PORT, f1ApiBaseUrl: result.data.F1_API_BASE_URL };
}

export const config = loadConfig(process.env);
