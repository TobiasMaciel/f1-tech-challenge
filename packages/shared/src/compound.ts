import { z } from 'zod';

export const compoundSchema = z.enum(['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET']);

export type Compound = z.infer<typeof compoundSchema>;
