import { z } from "zod";

export const CreateUpdateResourceGroupSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
});

export type CreateUpdateResourceGroupFormData = z.infer<
  typeof CreateUpdateResourceGroupSchema
>;
