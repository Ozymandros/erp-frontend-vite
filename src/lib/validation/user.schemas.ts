import { z } from 'zod'

// Create User validation schema
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  username: z.string().min(8, 'Username must be at least 8 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  roleIds: z.array(z.string()).optional()
})

export type CreateUserFormData = z.infer<typeof CreateUserSchema>

// Update User validation schema
export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional()
})

export type UpdateUserFormData = z.infer<typeof UpdateUserSchema>
