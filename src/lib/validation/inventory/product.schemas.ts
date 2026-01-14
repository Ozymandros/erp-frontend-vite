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

export const CreateProductSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: optionalString(1000, "Description must be less than 1000 characters"),
  category: optionalString(100, "Category must be less than 100 characters"),
  unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
  reorderLevel: z.number().int().min(0, "Reorder level must be 0 or greater"),
  isActive: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema;

export type CreateProductFormData = z.infer<typeof CreateProductSchema>;
export type UpdateProductFormData = z.infer<typeof UpdateProductSchema>;
