export function extractFieldErrors(err) {
  const payload = err?.payload;
  const errors = payload?.errors;

  if (!errors) {
    return { form: err?.message || "Request gagal", fields: {} };
  }

  const fields = {};
  const formErrors = [];

  for (const [key, val] of Object.entries(errors)) {
    if (key === "_errors") {
      if (Array.isArray(val)) formErrors.push(...val);
      continue;
    }
    if (Array.isArray(val)) fields[key] = val.join(", ");
  }

  return {
    form: formErrors.join("\n") || payload?.message || err?.message || "Gagal",
    fields,
  };
}