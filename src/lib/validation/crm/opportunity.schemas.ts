import { z } from "zod";
import { optionalString } from "../base.schemas";

export const CreateOpportunitySchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  ownerUsername: z
    .string()
    .min(1, "Owner username is required")
    .max(128, "Owner username is too long"),
  leadId: optionalString(64, "Lead is invalid"),
});

export const UpdateOpportunityForecastSchema = z.object({
  probability: z.number().min(0, "Probability must be between 0 and 1").max(1, "Probability must be between 0 and 1"),
  expectedAmount: z
    .preprocess(
      val => {
        if (val === "" || val === null || val === undefined) return undefined;
        return typeof val === "string" ? Number.parseFloat(val) : val;
      },
      z.number().min(0, "Expected amount must be 0 or greater").optional(),
    ),
  expectedCloseDate: optionalString(10, "Expected close date must be 10 characters or less"),
});

export const MoveOpportunityStageSchema = z.object({
  stage: z.string().min(1, "Stage is required").max(64, "Stage is too long"),
});

export const MarkOpportunityLostSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500, "Reason is too long"),
});

export const MarkOpportunityWonSchema = z.object({
  note: optionalString(500, "Note is too long"),
  convertToQuote: z.boolean(),
});

export const OpportunityLineSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  quantity: z
    .preprocess(
      val => (val === "" || val === null || val === undefined ? undefined : Number.parseFloat(String(val))),
      z.number().min(0.0001, "Quantity must be greater than 0"),
    ),
  unitPrice: z
    .preprocess(
      val => (val === "" || val === null || val === undefined ? undefined : Number.parseFloat(String(val))),
      z.number().min(0, "Unit price must be 0 or greater"),
    ),
  discountPercent: z
    .preprocess(
      val => {
        if (val === "" || val === null || val === undefined) return 0;
        if (typeof val === "string") return Number.parseFloat(val);
        return val;
      },
      z.number().min(0).max(1),
    ),
  productId: optionalString(64, "Product is invalid"),
  sku: optionalString(64, "SKU is too long"),
});

export type CreateOpportunityFormData = z.infer<typeof CreateOpportunitySchema>;
export type UpdateOpportunityForecastFormData = z.infer<typeof UpdateOpportunityForecastSchema>;
export type MoveOpportunityStageFormData = z.infer<typeof MoveOpportunityStageSchema>;
export type MarkOpportunityLostFormData = z.infer<typeof MarkOpportunityLostSchema>;
export type MarkOpportunityWonFormData = z.infer<typeof MarkOpportunityWonSchema>;
export type OpportunityLineFormData = z.infer<typeof OpportunityLineSchema>;

