/**
 * Conversation Validation Schemas
 * Zod schemas for validating conversation-related requests
 */

import { z } from 'zod'

/**
 * Schema for creating a new conversation
 */
export const CreateConversationSchema = z.object({
  title: z
    .string()
    .min(1, 'Conversation title is required')
    .max(255, 'Conversation title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  participantIds: z
    .array(z.string().min(1, 'Participant ID is required'))
    .min(1, 'At least one participant is required'),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>

/**
 * Schema for updating an existing conversation
 */
export const UpdateConversationSchema = z.object({
  title: z
    .string()
    .min(1, 'Conversation title is required')
    .max(255, 'Conversation title must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>

/**
 * Schema for validating query parameters when fetching conversations
 */
export const GetConversationsSchema = z.object({
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
    .enum(['createdAt', 'updatedAt', 'title'])
    .default('createdAt')
    .optional(),
  direction: z.enum(['asc', 'desc']).default('desc').optional(),
  participantId: z.string().optional(),
})

export type GetConversationsInput = z.infer<typeof GetConversationsSchema>

/**
 * Schema for validating conversation ID in path parameters
 */
export const ConversationIdSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
})

export type ConversationIdInput = z.infer<typeof ConversationIdSchema>
