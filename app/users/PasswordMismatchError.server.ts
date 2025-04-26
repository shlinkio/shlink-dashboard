export class PasswordMismatchError extends Error {
  constructor() {
    super('Passwords do not match');
    this.name = 'PasswordMismatchError';
  }
}
