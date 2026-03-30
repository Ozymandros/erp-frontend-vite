import { z } from "zod";
import { optionalEmail, optionalString, phoneValidation } from "../base.schemas";

export const CreateLeadSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  ownerUsername: z
    .string()
    .min(1, "Owner username is required")
    .max(128, "Owner username is too long"),
  source: optionalString(255, "Source must be 255 characters or less"),
  contactName: optionalString(255, "Contact name must be 255 characters or less"),
  contactEmail: optionalEmail,
  contactPhone: phoneValidation,
});

export const UpdateLeadSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  source: optionalString(255, "Source must be 255 characters or less"),
  contactName: optionalString(255, "Contact name must be 255 characters or less"),
  contactEmail: optionalEmail,
  contactPhone: phoneValidation,
});

export const QualifyLeadSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
});

export type CreateLeadFormData = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof UpdateLeadSchema>;
export type QualifyLeadFormData = z.infer<typeof QualifyLeadSchema>;

