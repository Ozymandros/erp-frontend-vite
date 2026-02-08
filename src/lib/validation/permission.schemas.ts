import { z } from 'zod'

// Helper for optional string fields: converts empty strings to undefined
const optionalString = (maxLength: number, errorMessage: string) =>
  z.preprocess(
    val => {
      if (!val || (typeof val === "string" && val.trim() === "")) {
        return undefined;
      }
      return typeof val === "string" ? val.trim() : val;
    },
    z.union([z.string().max(maxLength, errorMessage), z.undefined()])
  );

// Create Permission validation schema
export const CreatePermissionSchema = z.object({
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  description: optionalString(500, 'Description must be less than 500 characters')
})

export type CreatePermissionFormData = z.infer<typeof CreatePermissionSchema>

// Update Permission validation schema
export const UpdatePermissionSchema = z.object({
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  description: optionalString(500, 'Description must be less than 500 characters')
})

export type UpdatePermissionFormData = z.infer<typeof UpdatePermissionSchema>
