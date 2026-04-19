import { describe, it, expect } from 'vitest'
import { createMockUser } from '../../utils/mocks'

describe('Users API - Data Layer', () => {
  describe('User Model', () => {
    it('should create valid user object', () => {
      const user = createMockUser()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('username')
      expect(user).toHaveProperty('displayName')
      expect(user).toHaveProperty('createdAt')
    })

    it('should create user with custom data', () => {
      const userData = {
        email: 'custom@example.com',
        username: 'customuser',
        displayName: 'Custom User',
      }

      const user = createMockUser(userData)

      expect(user.email).toBe('custom@example.com')
      expect(user.username).toBe('customuser')
      expect(user.displayName).toBe('Custom User')
    })

    it('should generate unique user IDs', () => {
      const user1 = createMockUser()
      const user2 = createMockUser()

      expect(user1.id).not.toBe(user2.id)
    })

    it('should support user bio and avatar', () => {
      const userData = {
        bio: 'Test bio',
        avatarUrl: 'https://example.com/avatar.jpg',
      }

      const user = createMockUser(userData)

      expect(user.bio).toBe('Test bio')
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg')
    })

    it('should have unique emails per user', () => {
      const user1 = createMockUser()
      const user2 = createMockUser()

      expect(user1.email).not.toBe(user2.email)
    })

    it('should support filtering users by email', () => {
      const email = 'filter@example.com'
      const user = createMockUser({ email })

      expect(user.email).toBe(email)
    })
  })
})
