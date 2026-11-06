import { z } from "zod";
import { ResourceType } from "@/types/api.types";

export const CreateUpdateResourceSchema = z.object({
  resourceNo: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: z.nativeEnum(ResourceType).default(ResourceType.Person),
  resourceGroupId: z.string().uuid().optional().or(z.literal("")),
  userId: z.string().uuid().optional().or(z.literal("")),
  baseUnitOfMeasure: z.string().min(1).max(20).default("HOUR"),
  unitCost: z.coerce.number().min(0).default(0),
  unitPrice: z.coerce.number().min(0).default(0),
  dailyCapacity: z.coerce.number().min(0).max(24).default(8),
  blocked: z.boolean().default(false),
});

export type CreateUpdateResourceFormData = z.infer<
  typeof CreateUpdateResourceSchema
>;
