export class DuplicatedEntryError extends Error {
  readonly field: string;

  constructor(field: string) {
    super();

    this.name = 'DuplicatedEntryError';
    this.field = field;
  }
}
