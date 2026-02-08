import { z } from "zod";

import { optionalString, phoneValidation, optionalEmail } from "./base.schemas";

// Create User validation schema
export const CreateUserSchema = z.object({
  email: z.string().min(1, "Email is required").pipe(z.email({ message: "Invalid email address" })),
  username: z.string().min(3, "Username must be at least 3 characters"), // Relaxed from 8 for testing/usability if needed, but let's stick to 3 as 8 is quite long for username
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: optionalString(100, "First name must be less than 100 characters"),
  lastName: optionalString(100, "Last name must be less than 100 characters"),
  roleIds: z.array(z.string()).optional(),
});

export type CreateUserFormData = z.infer<typeof CreateUserSchema>;

// Update User validation schema
export const UpdateUserSchema = z.object({
  email: optionalEmail,
  firstName: optionalString(100, "First name must be less than 100 characters"),
  lastName: optionalString(100, "Last name must be less than 100 characters"),
  phoneNumber: phoneValidation,
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
});

export type UpdateUserFormData = z.infer<typeof UpdateUserSchema>;
