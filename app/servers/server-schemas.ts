import { z } from 'zod';

export const CREATE_SERVER_SCHEMA = z.object({
  name: z.string().trim().max(255),
  baseUrl: z.string().trim().url(),
  apiKey: z.string().trim(),
});

export type CreateServerData = z.infer<typeof CREATE_SERVER_SCHEMA>;

export const EDIT_SERVER_SCHEMA = CREATE_SERVER_SCHEMA.partial();

export type EditServerData = z.infer<typeof EDIT_SERVER_SCHEMA>;

export const USER_SERVERS = z.object({
  servers: z.array(z.string().trim().uuid()),
});

export type UserServers = z.infer<typeof USER_SERVERS>;
