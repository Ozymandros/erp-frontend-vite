import { z } from 'zod'

// Login validation schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be at most 100 characters')
})

export type LoginFormData = z.infer<typeof LoginSchema>

// Register validation schema
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username must be at most 100 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be at most 100 characters'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
  firstName: z.string().max(100, 'First name must be at most 100 characters').optional().or(z.literal('')),
  lastName: z.string().max(100, 'Last name must be at most 100 characters').optional().or(z.literal(''))
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm']
})

export type RegisterFormData = z.infer<typeof RegisterSchema>
