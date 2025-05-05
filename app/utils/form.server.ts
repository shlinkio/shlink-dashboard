export function formDataToRecord(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  const keys = formData.keys();

  for (const key of keys) {
    const isArray = key.endsWith('[]');
    const field = isArray ? key.slice(0, -2) : key;

    object[field] = isArray ? formData.getAll(key) : formData.get(key);
  }

  return object;
}
