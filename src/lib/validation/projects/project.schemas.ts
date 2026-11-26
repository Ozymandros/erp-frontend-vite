import { z } from "zod";
import { ProjectBlocked, ProjectStatus } from "@/types/api.types";

export const CreateProjectSchema = z.object({
  description: z.string().min(1).max(250),
  customerId: z.string().uuid("Customer is required"),
  projectManagerUserId: z.string().uuid().optional().or(z.literal("")),
  startingDate: z.string().optional(),
  endingDate: z.string().optional(),
  currencyCode: z.string().length(3).optional().or(z.literal("")),
  externalReference: z.string().max(100).optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.extend({
  currencyCode: z.string().length(3, "Currency code must be 3 characters"),
  blocked: z.nativeEnum(ProjectBlocked),
});

export const ChangeProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
});

export const CopyProjectSchema = z.object({
  description: z.string().max(250).optional(),
  customerId: z.string().uuid().optional().or(z.literal("")),
  includePlanningLines: z.boolean().default(true),
});

export type CreateProjectFormData = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectFormData = z.infer<typeof UpdateProjectSchema>;
export type ChangeProjectStatusFormData = z.infer<
  typeof ChangeProjectStatusSchema
>;
export type CopyProjectFormData = z.infer<typeof CopyProjectSchema>;
