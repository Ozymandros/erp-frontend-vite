import { z } from "zod";
import { optionalString } from "../base.schemas";

export const CreateActivitySchema = z.object({
  subject: z.string().min(1, "Subject is required").max(255, "Subject is too long"),
  type: z.string().min(1, "Type is required").max(64, "Type is too long"),
  dueAt: z.string().min(1, "Due date is required"),
  assignedToUsername: z
    .string()
    .min(1, "Assigned user is required")
    .max(128, "Assigned user is too long"),
  leadId: optionalString(64, "Lead is invalid"),
  opportunityId: optionalString(64, "Opportunity is invalid"),
  customerId: optionalString(64, "Customer is invalid"),
});

export const CompleteActivitySchema = z.object({
  note: optionalString(1000, "Note is too long"),
});

export type CreateActivityFormData = z.infer<typeof CreateActivitySchema>;
export type CompleteActivityFormData = z.infer<typeof CompleteActivitySchema>;

