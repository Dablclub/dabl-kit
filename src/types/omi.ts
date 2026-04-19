import { z } from 'zod'

/**
 * Schema for a single transcript segment from an Omi memory
 */
export const OmiTranscriptSegmentSchema = z.object({
  text: z.string(),
  speaker: z.string(),
  speaker_id: z.number(),
  is_user: z.boolean(),
  start: z.number(),
  end: z.number(),
})

export type OmiTranscriptSegment = z.infer<typeof OmiTranscriptSegmentSchema>

/**
 * Schema for an action item within a memory
 */
export const OmiActionItemSchema = z.object({
  description: z.string(),
  completed: z.boolean(),
})

export type OmiActionItem = z.infer<typeof OmiActionItemSchema>

/**
 * Schema for structured data extracted from the memory
 */
export const OmiStructuredDataSchema = z.object({
  title: z.string(),
  overview: z.string(),
  emoji: z.string(),
  category: z.string(),
  action_items: z.array(OmiActionItemSchema),
  events: z.array(z.unknown()).optional(),
})

export type OmiStructuredData = z.infer<typeof OmiStructuredDataSchema>

/**
 * Schema for geolocation data associated with the memory
 */
export const OmiGeolocationSchema = z.object({
  google_place_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  location_type: z.string(),
})

export type OmiGeolocation = z.infer<typeof OmiGeolocationSchema>

/**
 * Main schema for an Omi memory webhook payload
 * This represents the complete structure of data sent by Omi to the webhook endpoint
 */
export const OmiMemoryWebhookSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime(),
  source: z.string(),
  language: z.string(),
  structured: OmiStructuredDataSchema,
  transcript_segments: z.array(OmiTranscriptSegmentSchema),
  geolocation: OmiGeolocationSchema,
  photos: z.array(z.string()),
  plugins_results: z.unknown().optional(),
  external_data: z.unknown().optional(),
  discarded: z.boolean(),
  deleted: z.boolean(),
  visibility: z.string(),
  processing_memory_id: z.string().nullable(),
  status: z.string(),
})

export type OmiMemoryWebhook = z.infer<typeof OmiMemoryWebhookSchema>
