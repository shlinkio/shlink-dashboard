export const createFormData = (data: Record<string, string | string[] | undefined>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else if (value !== undefined) {
      formData.set(key, value);
    }
  });

  return formData;
};
