import { z } from "zod";

import { optionalString, phoneValidation, optionalEmail } from "./base.schemas";

// Create User validation schema
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  username: z.string().min(8, "Username must be at least 8 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
