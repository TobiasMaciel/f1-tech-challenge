import { z } from 'zod';

export const circuitTypeSchema = z.enum(['permanent', 'street', 'semi-street']);

export type CircuitType = z.infer<typeof circuitTypeSchema>;
