export class IncorrectPasswordError extends Error {
  constructor(username?: string) {
    super(username ? `Incorrect password for user ${username}` : 'Current password is invalid');
    this.name = 'IncorrectPasswordError';
  }
}
