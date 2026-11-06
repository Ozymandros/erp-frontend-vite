import { z } from "zod";
import { ProjectLineKind } from "@/types/api.types";

export const PostUsageSchema = z.object({
  projectTaskId: z.string().uuid(),
  planningLineId: z.string().uuid().optional().or(z.literal("")),
  kind: z.nativeEnum(ProjectLineKind).default(ProjectLineKind.Resource),
  resourceId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().max(250).optional(),
  quantity: z.coerce.number(),
  unitCostLcy: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  postingDate: z.string().optional(),
});

export const ItemConsumptionLineSchema = z.object({
  planningLineId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export const CreateItemConsumptionSchema = z.object({
  warehouseId: z.string().uuid(),
  postingDate: z.string().optional(),
  destinationAddress: z.string().max(500).optional(),
  lines: z.array(ItemConsumptionLineSchema).min(1),
});

export const CreateInvoiceRequestSchema = z.object({
  taxRate: z.coerce.number().min(0).max(100),
  lines: z
    .array(
      z.object({
        planningLineId: z.string().uuid(),
        quantity: z.coerce.number().min(0).optional(),
      })
    )
    .default([]),
});

export type PostUsageFormData = z.infer<typeof PostUsageSchema>;
export type CreateItemConsumptionFormData = z.infer<
  typeof CreateItemConsumptionSchema
>;
export type CreateInvoiceRequestFormData = z.infer<
  typeof CreateInvoiceRequestSchema
>;
