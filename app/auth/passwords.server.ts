import bcrypt from 'bcrypt';

export const hashPassword = async (plainTextPassword: string) => bcrypt.hash(plainTextPassword, 10);

export const verifyPassword = async (plainTextPassword: string, hashedPassword: string) =>
  bcrypt.compare(plainTextPassword, hashedPassword);
