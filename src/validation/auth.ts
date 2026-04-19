/**
 * Authentication Validation Schemas
 * Zod schemas for validating authentication-related requests
 */

import { z } from 'zod'

/**
 * Schema for basic authentication
 */
export const AuthSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export type AuthInput = z.infer<typeof AuthSchema>

/**
 * Schema for login request
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false).optional(),
})

export type LoginInput = z.infer<typeof LoginSchema>

/**
 * Schema for refresh token request
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>

/**
 * Schema for logout request
 */
export const LogoutSchema = z.object({
  refreshToken: z.string().optional(),
})

export type LogoutInput = z.infer<typeof LogoutSchema>

/**
 * Schema for password reset request
 */
export const PasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
})

export type PasswordResetInput = z.infer<typeof PasswordResetSchema>

/**
 * Schema for password reset confirmation
 */
export const PasswordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PasswordResetConfirmInput = z.infer<
  typeof PasswordResetConfirmSchema
>
