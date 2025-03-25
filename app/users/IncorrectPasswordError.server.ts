export class IncorrectPasswordError extends Error {
  constructor(username: string) {
    super(`Incorrect password for user ${username}`);
    this.name = 'IncorrectPasswordError';
  }
}
