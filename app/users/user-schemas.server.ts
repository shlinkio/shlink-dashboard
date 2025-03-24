import { z } from 'zod';
import { roles } from '../entities/User';

export const EDIT_USER_SCHEMA = z.object({
  displayName: z.string().trim().optional(),
  role: z.enum(roles).optional(),
});

export const CREATE_USER_SCHEMA = z.object({
  username: z.string().trim().regex(/^(?![._])[a-zA-Z0-9._]+(?<![._])$/),
  displayName: z.string().trim().optional(),
  role: z.enum(roles),
});
