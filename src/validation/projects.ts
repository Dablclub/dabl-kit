/**
 * Project Validation Schemas
 * Zod schemas for validating project-related requests
 */

import { z } from 'zod'

/**
 * Schema for creating a new project
 */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  adminId: z.string().min(1, 'Admin ID is required'),
  // Optional fields
  communityId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

/**
 * Schema for updating an existing project
 */
export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  communityId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

/**
 * Schema for validating query parameters when fetching projects
 */
export const GetProjectsSchema = z.object({
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
    .enum(['createdAt', 'updatedAt', 'name'])
    .default('createdAt')
    .optional(),
  direction: z.enum(['asc', 'desc']).default('desc').optional(),
  query: z.string().max(100).optional(),
})

export type GetProjectsInput = z.infer<typeof GetProjectsSchema>

/**
 * Schema for validating project ID in path parameters
 */
export const ProjectIdSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
})

export type ProjectIdInput = z.infer<typeof ProjectIdSchema>
