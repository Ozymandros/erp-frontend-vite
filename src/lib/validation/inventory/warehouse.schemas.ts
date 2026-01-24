import { z } from "zod";



export const CreateWarehouseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  location: z.string().min(1, "Location is required").max(255, "Location must be less than 255 characters"),
});

export const UpdateWarehouseSchema = CreateWarehouseSchema;

export type CreateWarehouseFormData = z.infer<typeof CreateWarehouseSchema>;
export type UpdateWarehouseFormData = z.infer<typeof UpdateWarehouseSchema>;
