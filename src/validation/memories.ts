/**
 * Memory Validation Schemas
 * Zod schemas for validating memory-related requests
 */

import { z } from 'zod'

/**
 * Schema for creating a new memory
 */
export const CreateMemorySchema = z.object({
  memory: z
    .string()
    .min(1, 'Memory content is required')
    .max(5000, 'Memory content must be less than 5000 characters'),
  userId: z.string().optional(),
  type: z.enum(['text', 'note', 'reminder']).default('text').optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateMemoryInput = z.infer<typeof CreateMemorySchema>

/**
 * Schema for updating an existing memory
 */
export const UpdateMemorySchema = z.object({
  memory: z
    .string()
    .min(1, 'Memory content is required')
    .max(5000, 'Memory content must be less than 5000 characters')
    .optional(),
  type: z.enum(['text', 'note', 'reminder']).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateMemoryInput = z.infer<typeof UpdateMemorySchema>

/**
 * Schema for validating query parameters when fetching memories
 */
export const GetMemoriesSchema = z.object({
  limit: z.coerce
    .number()
    .positive('Limit must be positive')
    .max(100, 'Limit must be at most 100')
    .default(10)
    .optional(),
  page: z.coerce
    .number()
    .positive('Page must be positive')
    .default(1)
    .optional(),
  userId: z.string().optional(),
  query: z.string().max(200, 'Query must be less than 200 characters').optional(),
  type: z.enum(['text', 'note', 'reminder']).optional(),
  orderBy: z
    .enum(['createdAt', 'updatedAt'])
    .default('createdAt')
    .optional(),
  direction: z.enum(['asc', 'desc']).default('desc').optional(),
})

export type GetMemoriesInput = z.infer<typeof GetMemoriesSchema>

/**
 * Schema for validating memory ID in path parameters
 */
export const MemoryIdSchema = z.object({
  id: z.string().min(1, 'Memory ID is required'),
})

export type MemoryIdInput = z.infer<typeof MemoryIdSchema>
