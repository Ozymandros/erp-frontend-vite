import { z } from "zod";

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().max(50, "Phone must be less than 50 characters").optional(),
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  country: z.string().max(100, "Country must be less than 100 characters").optional(),
  postalCode: z.string().max(20, "Postal code must be less than 20 characters").optional(),
  isActive: z.boolean().default(true),
});

export const UpdateCustomerSchema = CreateCustomerSchema;

export type CreateCustomerFormData = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof UpdateCustomerSchema>;
