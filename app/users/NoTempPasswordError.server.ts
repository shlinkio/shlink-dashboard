export class NoTempPasswordError extends Error {
  constructor() {
    super('Current password is not temporary. Change your password from the profile');
    this.name = 'NoTempPasswordError';
  }
}
