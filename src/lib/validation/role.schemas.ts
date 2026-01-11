import { z } from 'zod'

// Create Role validation schema
export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  permissionIds: z.array(z.string()).optional()
})

export type CreateRoleFormData = z.infer<typeof CreateRoleSchema>

// Update Role validation schema (same as create)
export const UpdateRoleSchema = CreateRoleSchema

export type UpdateRoleFormData = z.infer<typeof UpdateRoleSchema>
