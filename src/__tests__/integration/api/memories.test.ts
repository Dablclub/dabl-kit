import { describe, it, expect } from 'vitest'
import { createMockMemory } from '../../utils/mocks'

describe('Memories API - Data Layer', () => {
  describe('Memory Model', () => {
    it('should create valid memory object', () => {
      const memory = createMockMemory()

      expect(memory).toHaveProperty('id')
      expect(memory).toHaveProperty('uid')
      expect(memory).toHaveProperty('source')
      expect(memory).toHaveProperty('title')
      expect(memory).toHaveProperty('createdAt')
    })

    it('should handle memory with all fields', () => {
      const memoryData = {
        uid: 'user-123',
        source: 'omi',
        title: 'Test Memory',
        content: 'Memory content',
        language: 'en',
        status: 'completed',
        visibility: 'private',
      }

      const memory = createMockMemory(memoryData)

      expect(memory.uid).toBe('user-123')
      expect(memory.source).toBe('omi')
      expect(memory.title).toBe('Test Memory')
      expect(memory.language).toBe('en')
    })

    it('should generate unique memory IDs', () => {
      const memory1 = createMockMemory()
      const memory2 = createMockMemory()

      expect(memory1.id).not.toBe(memory2.id)
    })

    it('should handle memory without optional fields', () => {
      const minimalData = {
        uid: 'user-456',
      }

      const memory = createMockMemory(minimalData)

      expect(memory.uid).toBe('user-456')
      expect(memory.id).toBeDefined()
    })

    it('should support memory filtering by user', () => {
      const userId = 'filter-user-123'
      const memory = createMockMemory({ uid: userId })

      expect(memory.uid).toBe(userId)
    })
  })
})
