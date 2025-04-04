import { z } from 'zod';

export const CREATE_SERVER_SCHEMA = z.object({
  name: z.string().max(255).trim(),
  baseUrl: z.string().url().trim(),
  apiKey: z.string().trim(),
});

export type CreateServerData = z.infer<typeof CREATE_SERVER_SCHEMA>;

export const EDIT_SERVER_SCHEMA = CREATE_SERVER_SCHEMA.partial();

export type EditServerData = z.infer<typeof EDIT_SERVER_SCHEMA>;
