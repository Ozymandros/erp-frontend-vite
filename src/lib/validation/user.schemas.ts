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

// Create User validation schema
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  username: z.string().min(8, "Username must be at least 8 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
  roleIds: z.array(z.string()).optional(),
});

export type CreateUserFormData = z.infer<typeof CreateUserSchema>;

// Email validation: optional but if provided must be valid email format
const emailValidation = z.preprocess(val => {
  if (!val || (typeof val === "string" && val.trim() === "")) {
    return undefined;
  }
  return typeof val === "string" ? val.trim() : val;
}, z.string().max(255, "Email must be less than 255 characters").email("Invalid email address").optional());

// Update User validation schema
export const UpdateUserSchema = z.object({
  email: emailValidation,
  firstName: z.string().optional().or(z.literal("")),
  lastName: z.string().optional().or(z.literal("")),
  phoneNumber: phoneValidation,
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
});

export type UpdateUserFormData = z.infer<typeof UpdateUserSchema>;
