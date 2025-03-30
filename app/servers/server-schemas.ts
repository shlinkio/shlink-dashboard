import { z } from 'zod';

export const CREATE_SERVER_SCHEMA = z.object({
  name: z.string().max(255).trim(),
  baseUrl: z.string().url().trim(),
  apiKey: z.string(),
});

export type ServerData = z.infer<typeof CREATE_SERVER_SCHEMA>;
