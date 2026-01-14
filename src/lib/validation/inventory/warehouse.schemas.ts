import { z } from "zod";

// Helper for optional string fields: converts empty strings to undefined
const optionalString = (maxLength: number, errorMessage: string) =>
  z.preprocess(
    val => {
      if (!val || (typeof val === "string" && val.trim() === "")) {
        return undefined;
      }
      return typeof val === "string" ? val.trim() : val;
    },
    z.union([z.string().max(maxLength, errorMessage), z.undefined()])
  );

export const CreateWarehouseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  location: z.string().min(1, "Location is required").max(255, "Location must be less than 255 characters"),
  address: optionalString(500, "Address must be less than 500 characters"),
  city: optionalString(100, "City must be less than 100 characters"),
  country: optionalString(100, "Country must be less than 100 characters"),
  postalCode: optionalString(20, "Postal code must be less than 20 characters"),
  isActive: z.boolean().default(true),
});

export const UpdateWarehouseSchema = CreateWarehouseSchema;

export type CreateWarehouseFormData = z.infer<typeof CreateWarehouseSchema>;
export type UpdateWarehouseFormData = z.infer<typeof UpdateWarehouseSchema>;
