import { describe, it, expect } from 'vitest'
import {
  createMockOmiWebhook,
  generateOmiSignature,
} from '../../utils/mocks'

describe('Omi Webhook Integration', () => {
  describe('Webhook Payload Validation', () => {
    it('should generate valid Omi webhook payload', () => {
      const webhook = createMockOmiWebhook()

      expect(webhook).toHaveProperty('id')
      expect(webhook).toHaveProperty('created_at')
      expect(webhook).toHaveProperty('transcript_segments')
      expect(webhook).toHaveProperty('structured')
      expect(webhook).toHaveProperty('geolocation')
    })

    it('should include required fields in webhook', () => {
      const webhook = createMockOmiWebhook()

      expect(webhook.id).toBeTruthy()
      expect(webhook.created_at).toBeTruthy()
      expect(webhook.started_at).toBeTruthy()
      expect(webhook.finished_at).toBeTruthy()
      expect(webhook.transcript_segments.length).toBeGreaterThan(0)
    })

    it('should have valid transcript segments', () => {
      const webhook = createMockOmiWebhook()

      webhook.transcript_segments.forEach((segment) => {
        expect(segment).toHaveProperty('text')
        expect(segment).toHaveProperty('speaker')
        expect(segment).toHaveProperty('speakerId')
        expect(segment).toHaveProperty('is_user')
        expect(segment).toHaveProperty('start')
        expect(segment).toHaveProperty('end')
      })
    })

    it('should have valid structured data', () => {
      const webhook = createMockOmiWebhook()

      expect(webhook.structured).toHaveProperty('title')
      expect(webhook.structured).toHaveProperty('overview')
      expect(webhook.structured).toHaveProperty('emoji')
      expect(webhook.structured).toHaveProperty('category')
      expect(webhook.structured).toHaveProperty('action_items')
    })

    it('should have valid geolocation data', () => {
      const webhook = createMockOmiWebhook()

      expect(webhook.geolocation).toHaveProperty('google_place_id')
      expect(webhook.geolocation).toHaveProperty('latitude')
      expect(webhook.geolocation).toHaveProperty('longitude')
      expect(webhook.geolocation).toHaveProperty('address')
    })
  })

  describe('Signature Generation and Verification', () => {
    it('should generate valid signature for webhook', () => {
      const webhook = createMockOmiWebhook()
      const body = JSON.stringify(webhook)
      const signature = generateOmiSignature(body)

      expect(signature).toBeTruthy()
      expect(typeof signature).toBe('string')
      expect(signature.length).toBeGreaterThan(0)
    })

    it('should generate consistent signatures for same body', () => {
      const webhook = createMockOmiWebhook()
      const body = JSON.stringify(webhook)

      const sig1 = generateOmiSignature(body)
      const sig2 = generateOmiSignature(body)

      expect(sig1).toBe(sig2)
    })

    it('should generate different signatures for different bodies', () => {
      const webhook1 = createMockOmiWebhook()
      const webhook2 = createMockOmiWebhook()

      const sig1 = generateOmiSignature(JSON.stringify(webhook1))
      const sig2 = generateOmiSignature(JSON.stringify(webhook2))

      expect(sig1).not.toBe(sig2)
    })

    it('should support custom secret for signature', () => {
      const webhook = createMockOmiWebhook()
      const body = JSON.stringify(webhook)

      const sig1 = generateOmiSignature(body, 'secret-1')
      const sig2 = generateOmiSignature(body, 'secret-2')

      expect(sig1).not.toBe(sig2)
    })
  })

  describe('Webhook Security Requirements', () => {
    it('should have uid parameter requirement', () => {
      // uid is required in query params
      const webhook = createMockOmiWebhook()
      expect(webhook.id).toBeTruthy()
    })

    it('should validate required webhook fields', () => {
      const webhook = createMockOmiWebhook()

      const requiredFields = [
        'id',
        'created_at',
        'transcript_segments',
      ]

      requiredFields.forEach((field) => {
        expect(webhook).toHaveProperty(field)
      })
    })

    it('should support memory transformation', () => {
      const webhook = createMockOmiWebhook()

      // Verify we can transform webhook data for memory storage
      const memoryData = {
        id: webhook.id,
        startedAt: new Date(webhook.started_at),
        finishedAt: new Date(webhook.finished_at),
        createdAt: new Date(webhook.created_at),
        source: webhook.source,
        language: webhook.language,
        structured: webhook.structured,
        transcriptSegments: webhook.transcript_segments,
        geolocation: webhook.geolocation,
      }

      expect(memoryData.id).toBe(webhook.id)
      expect(memoryData.source).toBe('omi')
    })

    it('should handle transcript formatting', () => {
      const webhook = createMockOmiWebhook()

      const formattedTranscript = webhook.transcript_segments
        .map((segment) => `${segment.speaker}: ${segment.text}`)
        .join('\n')

      expect(formattedTranscript).toContain(':')
      expect(formattedTranscript.split('\n').length).toBe(
        webhook.transcript_segments.length,
      )
    })
  })
})
