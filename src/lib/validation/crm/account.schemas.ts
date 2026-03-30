import { z } from "zod";

export const UpdateAccountOwnerSchema = z.object({
  ownerUsername: z
    .string()
    .min(1, "Owner username is required")
    .max(128, "Owner username is too long"),
});

export type UpdateAccountOwnerFormData = z.infer<typeof UpdateAccountOwnerSchema>;

