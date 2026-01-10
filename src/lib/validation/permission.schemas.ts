import { z } from 'zod'

// Create Permission validation schema
export const CreatePermissionSchema = z.object({
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  description: z.string().optional().or(z.literal(''))
})

export type CreatePermissionFormData = z.infer<typeof CreatePermissionSchema>

// Update Permission validation schema
export const UpdatePermissionSchema = z.object({
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  description: z.string().optional().or(z.literal(''))
})

export type UpdatePermissionFormData = z.infer<typeof UpdatePermissionSchema>
