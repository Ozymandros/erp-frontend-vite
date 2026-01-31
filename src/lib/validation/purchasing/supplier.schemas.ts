import { z } from "zod";

import { optionalString, phoneValidation } from "../base.schemas";

export const CreateSupplierSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .email("Invalid email address"),
  phone: phoneValidation,
  address: optionalString(500, "Address must be less than 500 characters"),
  city: optionalString(100, "City must be less than 100 characters"),
  country: optionalString(100, "Country must be less than 100 characters"),
  postalCode: optionalString(20, "Postal code must be less than 20 characters"),
  isActive: z.boolean().default(true),
});

export const UpdateSupplierSchema = CreateSupplierSchema;

export type CreateSupplierFormData = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierFormData = z.infer<typeof UpdateSupplierSchema>;
