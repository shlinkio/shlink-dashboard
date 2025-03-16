import { hashPassword } from '../app/auth/passwords.server';

const password = process.argv[2];
if (!password) {
  console.error('A password to hash needs to be provided');
  process.exit(1);
}

console.log(`Password: ${password}`);
console.log(`Password hash: ${await hashPassword(password)}`);
process.exit(0);
