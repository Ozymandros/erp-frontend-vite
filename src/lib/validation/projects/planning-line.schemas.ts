import { z } from "zod";
import { PlanningLineType, ProjectLineKind } from "@/types/api.types";

export const CreateUpdatePlanningLineSchema = z.object({
  projectTaskId: z.string().uuid(),
  lineType: z.nativeEnum(PlanningLineType).default(PlanningLineType.BudgetAndBillable),
  kind: z.nativeEnum(ProjectLineKind).default(ProjectLineKind.Resource),
  resourceId: z.string().uuid().optional().or(z.literal("")),
  productId: z.string().uuid().optional().or(z.literal("")),
  warehouseId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().max(250).optional(),
  unitOfMeasure: z.string().max(20).optional(),
  planningDate: z.string().optional(),
  quantity: z.coerce.number().min(0),
  unitCostLcy: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  lineDiscountPercent: z.coerce.number().min(0).max(100).default(0),
});

export type CreateUpdatePlanningLineFormData = z.infer<
  typeof CreateUpdatePlanningLineSchema
>;
