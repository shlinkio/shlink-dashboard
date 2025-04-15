import { z } from 'zod';
import { roles } from '../entities/User';

export const EDIT_USER_SCHEMA = z.object({
  displayName: z.string().max(255).trim().optional(),
  role: z.enum(roles).optional(),
});

export const CREATE_USER_SCHEMA = z.object({
  username: z.string().max(255).trim().regex(/^(?![._])[a-zA-Z0-9._]+(?<![._])$/),
  displayName: z.string().max(255).trim().optional(),
  role: z.enum(roles),
});

export type CreateUserData = z.infer<typeof CREATE_USER_SCHEMA>;
