import type { ZodError } from 'zod';

export class ValidationError extends Error {
  readonly invalidFields: Record<string, string>;

  constructor(invalidFields: Record<string, string>) {
    super('Provided data is invalid');

    this.name = 'ValidationError';
    this.invalidFields = invalidFields;
  }

  static fromZodError(error: ZodError): ValidationError {
    const invalidFields: Record<string, string> = {};
    error.issues.forEach((error) => {
      invalidFields[error.path.join('.')] = error.message;
    });

    return new ValidationError(invalidFields);
  }
}
