/**
 * User Validation Schemas
 * Zod schemas for validating user-related requests
 */

import { z } from 'zod'

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Schema for creating a new user
 */
export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(255, 'Display name must be less than 255 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
  appWallet: z.string().optional(),
  extWallet: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

/**
 * Schema for updating an existing user
 */
export const UpdateUserSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(255, 'Display name must be less than 255 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
  bannerUrl: z
    .string()
    .url('Invalid banner URL')
    .optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

/**
 * Schema for validating query parameters when fetching users
 */
export const GetUsersSchema = z.object({
  take: z.coerce
    .number()
    .positive('Take must be positive')
    .max(100, 'Take must be at most 100')
    .default(10)
    .optional(),
  skip: z.coerce
    .number()
    .nonnegative('Skip must be non-negative')
    .default(0)
    .optional(),
  cursor: z.string().optional(),
  orderBy: z
    .enum(['id', 'createdAt', 'updatedAt', 'username'])
    .default('id')
    .optional(),
  direction: z.enum(['asc', 'desc']).default('desc').optional(),
})

export type GetUsersInput = z.infer<typeof GetUsersSchema>

/**
 * Schema for validating user ID in path parameters
 */
export const UserIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
})

export type UserIdInput = z.infer<typeof UserIdSchema>
