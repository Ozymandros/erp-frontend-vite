import type { ZodError } from "zod";

/**
 * Converts Zod validation error issues to a flat Record<fieldPath, message>.
 * Used for form field error display (e.g. setFieldErrors).
 */
export function parseZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = issue.path[0]?.toString();
    if (key) errors[key] = issue.message;
  });
  return errors;
}
