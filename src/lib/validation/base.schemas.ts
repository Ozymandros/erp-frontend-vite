import { z } from "zod";

/**
 * Helper for optional string fields: converts empty or whitespace-only strings to undefined.
 * This is useful for backend compatibility where empty strings might not be desired for optional fields.
 */
export const optionalString = (maxLength: number, errorMessage: string) =>
  z.preprocess(
    val => {
      if (!val || (typeof val === "string" && val.trim() === "")) {
        return undefined;
      }
      return typeof val === "string" ? val.trim() : val;
    },
    z.union([z.string().max(maxLength, errorMessage), z.undefined()])
  );

/**
 * Standard Phone Validation
 * Supports:
 * - US Formats: (555) 123-4567, 555-123-4567, 555.123.4567, 5551234567
 * - International/European Formats: Starts with + followed by 7-15 digits (e.g., +34 912 345 678)
 * 
 * ReDoS Safe: Uses simple, anchored, non-backtracking patterns.
 */
export const phoneValidation = z.preprocess(
  val => {
    if (!val || (typeof val === "string" && val.trim() === "")) {
      return undefined;
    }
    return typeof val === "string" ? val.trim() : val;
  },
  z
    .string()
    .max(50, "Phone must be less than 50 characters")
    .refine(val => {
      // 1. Basic character check (linear) - only allowed symbols
      if (/[^0-9\s.\-()+]/.test(val)) return false;

      const digitsOnly = val.replace(/\D/g, "");

      // 2. International Format (+ required)
      if (val.startsWith("+")) {
        // Must have 7-15 digits according to E.164
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
      }

      // 3. US Format (10 digits)
      // We check for common US patterns explicitly to avoid being "too broad"
      // Patterns: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX, XXXXXXXXXX
      const usPattern = /^(\(\d{3}\)|\d{3})[-\s.]?\d{3}[-\s.]?\d{4}$/;
      if (usPattern.test(val)) return true;

      // 4. Other National Formats (likely European/Domestic)
      // Allow 7-14 digits if it's purely digits or simple separators
      // This is slightly broad but captures most European local formats (9-12 digits usually)
      return digitsOnly.length >= 7 && digitsOnly.length <= 14;
    }, {
      message: "Invalid phone number format. Use US (e.g., (555) 123-4567) or International (e.g., +34 912 345 678).",
    })
    .optional()
);

/**
 * Optional Email Validation
 * Converts empty strings to undefined, validates format if provided.
 */
export const optionalEmail = z.preprocess(
  val => {
    if (!val || (typeof val === "string" && val.trim() === "")) {
      return undefined;
    }
    return typeof val === "string" ? val.trim() : val;
  },
  z.string().max(255, "Email must be less than 255 characters").pipe(z.email({ message: "Invalid email address" })).optional()
);
