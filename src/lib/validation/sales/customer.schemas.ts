import { z } from "zod";

// Phone number validation: allows digits, spaces, hyphens, parentheses, plus sign, and dots
// Examples: +1-555-123-4567, (555) 123-4567, 555.123.4567, +34 912 345 678
const phoneRegex =
  /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}[-\s.]?[0-9]{1,9}$/;

const phoneValidation = z.preprocess(
  val => {
    if (!val || (typeof val === "string" && val.trim() === "")) {
      return undefined;
    }
    return typeof val === "string" ? val.trim() : val;
  },
  z
    .string()
    .max(50, "Phone must be less than 50 characters")
    .refine(val => phoneRegex.test(val), {
      message:
        "Invalid phone number format. Use format: +1-555-123-4567 or (555) 123-4567",
    })
    .optional()
);

// Email validation: optional but if provided must be valid email format
const emailValidation = z.preprocess(val => {
  if (!val || (typeof val === "string" && val.trim() === "")) {
    return undefined;
  }
  return typeof val === "string" ? val.trim() : val;
}, z.string().max(255, "Email must be less than 255 characters").email("Invalid email address").optional());

export const CreateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  email: emailValidation,
  phone: phoneValidation,
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  country: z
    .string()
    .max(100, "Country must be less than 100 characters")
    .optional(),
  postalCode: z
    .string()
    .max(20, "Postal code must be less than 20 characters")
    .optional(),
  isActive: z.boolean().default(true),
});

export const UpdateCustomerSchema = CreateCustomerSchema;

export type CreateCustomerFormData = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof UpdateCustomerSchema>;
