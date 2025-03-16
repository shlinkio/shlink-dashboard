import { z } from 'zod';
import { roles } from '../entities/User';

export const USER_CREATION_SCHEMA = z.object({
  username: z.string().regex(/^(?![._])[a-zA-Z0-9._]+(?<![._])$/),
  displayName: z.string().optional(),
  role: z.enum(roles),
});
