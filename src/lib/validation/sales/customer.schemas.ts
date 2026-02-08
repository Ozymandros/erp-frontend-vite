import { z } from "zod";

import { optionalString, phoneValidation, optionalEmail } from "../base.schemas";

export const CreateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  email: optionalEmail,
  phoneNumber: phoneValidation,
  address: optionalString(500, "Address must be less than 500 characters"),
});

export const UpdateCustomerSchema = CreateCustomerSchema;

export type CreateCustomerFormData = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof UpdateCustomerSchema>;
