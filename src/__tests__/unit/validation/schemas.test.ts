import { describe, it, expect } from 'vitest'
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectsSchema,
  ProjectIdSchema,
} from '@/validation/projects'
import {
  CreateUserSchema,
  UpdateUserSchema,
  GetUsersSchema,
  UserIdSchema,
} from '@/validation/users'

describe('Validation Schemas', () => {
  describe('Project Schemas', () => {
    describe('CreateProjectSchema', () => {
      it('should validate a valid project creation', () => {
        const validData = {
          name: 'Test Project',
          adminId: 'user-123',
          description: 'A test project',
        }

        const result = CreateProjectSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should validate project without optional description', () => {
        const validData = {
          name: 'Test Project',
          adminId: 'user-123',
        }

        const result = CreateProjectSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject project with empty name', () => {
        const invalidData = {
          name: '',
          adminId: 'user-123',
        }

        const result = CreateProjectSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })

      it('should reject project with missing adminId', () => {
        const invalidData = {
          name: 'Test Project',
        }

        const result = CreateProjectSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject project with name exceeding max length', () => {
        const invalidData = {
          name: 'a'.repeat(256),
          adminId: 'user-123',
        }

        const result = CreateProjectSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject project with description exceeding max length', () => {
        const invalidData = {
          name: 'Test Project',
          adminId: 'user-123',
          description: 'a'.repeat(1001),
        }

        const result = CreateProjectSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('UpdateProjectSchema', () => {
      it('should validate partial project update', () => {
        const validData = {
          name: 'Updated Project',
        }

        const result = UpdateProjectSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should allow empty update object', () => {
        const validData = {}

        const result = UpdateProjectSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid description length', () => {
        const invalidData = {
          description: 'a'.repeat(1001),
        }

        const result = UpdateProjectSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('GetProjectsSchema', () => {
      it('should validate default pagination', () => {
        const validData = {}

        const result = GetProjectsSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should validate custom pagination parameters', () => {
        const validData = {
          take: 20,
          skip: 10,
          orderBy: 'name',
          direction: 'asc',
        }

        const result = GetProjectsSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid take value (zero)', () => {
        const invalidData = {
          take: 0,
        }

        const result = GetProjectsSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject take exceeding max value', () => {
        const invalidData = {
          take: 101,
        }

        const result = GetProjectsSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject invalid orderBy', () => {
        const invalidData = {
          orderBy: 'invalidField',
        }

        const result = GetProjectsSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should validate search query', () => {
        const validData = {
          query: 'test project',
        }

        const result = GetProjectsSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    describe('ProjectIdSchema', () => {
      it('should validate a valid project ID', () => {
        const validData = {
          id: 'proj-123',
        }

        const result = ProjectIdSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject empty project ID', () => {
        const invalidData = {
          id: '',
        }

        const result = ProjectIdSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('User Schemas', () => {
    describe('CreateUserSchema', () => {
      it('should validate a valid user creation', () => {
        const validData = {
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
        }

        const result = CreateUserSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject username shorter than 3 characters', () => {
        const invalidData = {
          username: 'ab',
          displayName: 'Test User',
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 3')
        }
      })

      it('should reject username exceeding max length', () => {
        const invalidData = {
          username: 'a'.repeat(33),
          displayName: 'Test User',
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject invalid email format', () => {
        const invalidData = {
          username: 'testuser',
          displayName: 'Test User',
          email: 'not-an-email',
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should validate username with allowed characters', () => {
        const validData = {
          username: 'test_user-123',
          displayName: 'Test User',
        }

        const result = CreateUserSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject username with invalid characters', () => {
        const invalidData = {
          username: 'test@user!',
          displayName: 'Test User',
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject invalid website URL', () => {
        const invalidData = {
          username: 'testuser',
          displayName: 'Test User',
          website: 'not-a-url',
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should validate with optional bio and avatar', () => {
        const validData = {
          username: 'testuser',
          displayName: 'Test User',
          bio: 'I am a test user',
          avatarUrl: 'https://example.com/avatar.jpg',
        }

        const result = CreateUserSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject bio exceeding max length', () => {
        const invalidData = {
          username: 'testuser',
          displayName: 'Test User',
          bio: 'a'.repeat(501),
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })

      it('should reject display name exceeding max length', () => {
        const invalidData = {
          username: 'testuser',
          displayName: 'a'.repeat(256),
        }

        const result = CreateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('UpdateUserSchema', () => {
      it('should validate partial user update', () => {
        const validData = {
          displayName: 'Updated User',
        }

        const result = UpdateUserSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should allow empty update object', () => {
        const validData = {}

        const result = UpdateUserSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should validate email update', () => {
        const validData = {
          email: 'newemail@example.com',
        }

        const result = UpdateUserSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid email in update', () => {
        const invalidData = {
          email: 'invalid-email',
        }

        const result = UpdateUserSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('GetUsersSchema', () => {
      it('should validate default user query', () => {
        const validData = {}

        const result = GetUsersSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should validate custom user pagination', () => {
        const validData = {
          take: 25,
          skip: 5,
          orderBy: 'username',
          direction: 'asc',
        }

        const result = GetUsersSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject invalid orderBy for users', () => {
        const invalidData = {
          orderBy: 'email', // not in allowed enum
        }

        const result = GetUsersSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })

    describe('UserIdSchema', () => {
      it('should validate a valid user ID', () => {
        const validData = {
          id: 'user-456',
        }

        const result = UserIdSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should reject empty user ID', () => {
        const invalidData = {
          id: '',
        }

        const result = UserIdSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Schema Type Safety', () => {
    it('should correctly infer types for CreateProjectSchema', () => {
      const validData = {
        name: 'Project',
        adminId: 'admin-1',
      }

      const result = CreateProjectSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Project')
      }
    })

    it('should correctly infer types for CreateUserSchema', () => {
      const validData = {
        username: 'user123',
        displayName: 'User Name',
      }

      const result = CreateUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.username).toBe('user123')
      }
    })
  })
})
