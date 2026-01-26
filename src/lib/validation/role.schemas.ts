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

// Create Role validation schema
export const CreateRoleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: optionalString(500, 'Description must be less than 500 characters'),
  permissionIds: z.array(z.string()).optional()
})

export type CreateRoleFormData = z.infer<typeof CreateRoleSchema>

// Update Role validation schema (same as create)
export const UpdateRoleSchema = CreateRoleSchema

export type UpdateRoleFormData = z.infer<typeof UpdateRoleSchema>
