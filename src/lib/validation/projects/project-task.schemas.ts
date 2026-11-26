import { z } from "zod";
import { ProjectTaskType } from "@/types/api.types";

export const CreateProjectTaskSchema = z.object({
  parentTaskId: z.string().uuid().optional().or(z.literal("")),
  taskNo: z.string().min(1).max(20),
  description: z.string().min(1).max(250),
  taskType: z.nativeEnum(ProjectTaskType).default(ProjectTaskType.Posting),
  sortOrder: z.coerce.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const UpdateProjectTaskSchema = CreateProjectTaskSchema.omit({
  parentTaskId: true,
  sortOrder: true,
});

export const MoveProjectTaskSchema = z.object({
  newParentTaskId: z.string().uuid().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().optional(),
});

export type CreateProjectTaskFormData = z.infer<typeof CreateProjectTaskSchema>;
export type UpdateProjectTaskFormData = z.infer<typeof UpdateProjectTaskSchema>;
export type MoveProjectTaskFormData = z.infer<typeof MoveProjectTaskSchema>;
