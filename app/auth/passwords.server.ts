import * as argon2 from 'argon2';

export const hashPassword = async (plainTextPassword: string) => argon2.hash(plainTextPassword);

export const verifyPassword = async (plainTextPassword: string, hashedPassword: string) =>
  argon2.verify(hashedPassword, plainTextPassword);
