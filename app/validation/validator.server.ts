import type { ZodObject, ZodRawShape } from 'zod';
import { ZodArray , ZodError } from 'zod';
import { ValidationError } from './ValidationError.server';

/**
 * Validates a zod schema against an object.
 *
 * @return - Parsed object.
 * @throws ValidationError if data does not fulfil the schema.
 */
export function validateSchema<T extends ZodRawShape>(
  schema: ZodObject<T>,
  object: unknown,
): ReturnType<typeof schema['parse']> {
  try {
    return schema.parse(object);
  } catch (e) {
    if (!(e instanceof ZodError)) {
      throw e;
    }

    throw ValidationError.fromZodError(e);
  }
}

/**
 * Validates a one-dimensional zod schema against a FormData object.
 *
 * @return - Parsed object.
 * @throws ValidationError if data does not fulfil the schema.
 */
export function validateFormDataSchema<T extends ZodRawShape>(
  schema: ZodObject<T>,
  formData: FormData,
): ReturnType<typeof schema['parse']> {
  const fields = Object.keys(schema.shape);
  const object: Record<string, FormDataEntryValue | FormDataEntryValue[] | undefined> = {};

  fields.forEach((field) => {
    const isArray = schema.shape[field] instanceof ZodArray;
    object[field] = isArray ? formData.getAll(field) : (formData.get(field) ?? undefined);
  });

  return validateSchema(schema, object);
}
