import { z } from "zod";
import { optionalEmail, optionalString, phoneValidation } from "../base.schemas";

export const CreateContactSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(200, "Full name is too long"),
  email: optionalEmail,
  phone: phoneValidation,
  title: optionalString(128, "Title is too long"),
  isPrimary: z.boolean().optional(),
});

export const UpdateContactSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(200, "Full name is too long"),
  email: optionalEmail,
  phone: phoneValidation,
  title: optionalString(128, "Title is too long"),
});

export type CreateContactFormData = z.infer<typeof CreateContactSchema>;
export type UpdateContactFormData = z.infer<typeof UpdateContactSchema>;

