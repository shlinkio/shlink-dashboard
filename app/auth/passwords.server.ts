import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

export const hashPassword = async (plainTextPassword: string) => argon2.hash(plainTextPassword);

export const verifyPassword = async (plainTextPassword: string, hashedPassword: string) =>
  argon2.verify(hashedPassword, plainTextPassword);

export const generatePassword = (length = 12) => {
  const normalizedLength = Math.max(1, length);
  return randomBytes(normalizedLength).toString('base64').slice(0, normalizedLength);
};
