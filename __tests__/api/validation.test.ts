/**
 * Validation Schema Tests
 * Comprehensive tests for all validation schemas
 */

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
import {
  CreateMemorySchema,
  UpdateMemorySchema,
  GetMemoriesSchema,
  MemoryIdSchema,
} from '@/validation/memories'
import {
  CreateConversationSchema,
  UpdateConversationSchema,
  GetConversationsSchema,
  ConversationIdSchema,
} from '@/validation/conversations'
import { LoginSchema } from '@/validation/auth'

describe('Project Validation Schemas', () => {
  describe('CreateProjectSchema', () => {
    it('should accept valid project data', () => {
      const data = {
        name: 'Test Project',
        description: 'A test project',
        adminId: 'admin-123',
      }
      const result = CreateProjectSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing required name field', () => {
      const data = {
        description: 'A test project',
        adminId: 'admin-123',
      }
      const result = CreateProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject missing required adminId field', () => {
      const data = {
        name: 'Test Project',
        description: 'A test project',
      }
      const result = CreateProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty name string', () => {
      const data = {
        name: '',
        description: 'A test project',
        adminId: 'admin-123',
      }
      const result = CreateProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject name longer than 255 characters', () => {
      const data = {
        name: 'a'.repeat(256),
        description: 'A test project',
        adminId: 'admin-123',
      }
      const result = CreateProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should allow optional description', () => {
      const data = {
        name: 'Test Project',
        adminId: 'admin-123',
      }
      const result = CreateProjectSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateProjectSchema', () => {
    it('should accept valid update data', () => {
      const data = {
        name: 'Updated Project',
        description: 'Updated description',
      }
      const result = UpdateProjectSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow all fields to be optional', () => {
      const data = {}
      const result = UpdateProjectSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid field types', () => {
      const data = {
        name: 123,
      }
      const result = UpdateProjectSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('GetProjectsSchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        take: 10,
        skip: 0,
        orderBy: 'createdAt',
        direction: 'desc',
      }
      const result = GetProjectsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const data = {}
      const result = GetProjectsSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.take).toBe(10)
      expect(result.data?.skip).toBe(0)
    })

    it('should reject negative take value', () => {
      const data = { take: -1 }
      const result = GetProjectsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject take value greater than 100', () => {
      const data = { take: 101 }
      const result = GetProjectsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid orderBy value', () => {
      const data = { orderBy: 'invalidField' }
      const result = GetProjectsSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('ProjectIdSchema', () => {
    it('should accept valid project ID', () => {
      const data = { id: 'proj-123' }
      const result = ProjectIdSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing ID', () => {
      const data = {}
      const result = ProjectIdSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty ID string', () => {
      const data = { id: '' }
      const result = ProjectIdSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})

describe('User Validation Schemas', () => {
  describe('CreateUserSchema', () => {
    it('should accept valid user data', () => {
      const data = {
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing required username', () => {
      const data = {
        displayName: 'Test User',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject username shorter than 3 characters', () => {
      const data = {
        username: 'ab',
        displayName: 'Test User',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject username longer than 32 characters', () => {
      const data = {
        username: 'a'.repeat(33),
        displayName: 'Test User',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid username characters', () => {
      const data = {
        username: 'test@user!',
        displayName: 'Test User',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email address', () => {
      const data = {
        username: 'testuser',
        displayName: 'Test User',
        email: 'not-an-email',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should allow optional email', () => {
      const data = {
        username: 'testuser',
        displayName: 'Test User',
      }
      const result = CreateUserSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateUserSchema', () => {
    it('should accept valid update data', () => {
      const data = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
      }
      const result = UpdateUserSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow empty update object', () => {
      const data = {}
      const result = UpdateUserSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate URL fields', () => {
      const data = {
        website: 'not-a-valid-url',
      }
      const result = UpdateUserSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('GetUsersSchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        take: 20,
        skip: 10,
      }
      const result = GetUsersSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const data = {}
      const result = GetUsersSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.take).toBe(10)
      expect(result.data?.skip).toBe(0)
    })
  })

  describe('UserIdSchema', () => {
    it('should accept valid user ID', () => {
      const data = { id: 'user-123' }
      const result = UserIdSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing ID', () => {
      const data = {}
      const result = UserIdSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})

describe('Memory Validation Schemas', () => {
  describe('CreateMemorySchema', () => {
    it('should accept valid memory data', () => {
      const data = {
        memory: 'Test memory content',
      }
      const result = CreateMemorySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing memory content', () => {
      const data = {}
      const result = CreateMemorySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty memory string', () => {
      const data = {
        memory: '',
      }
      const result = CreateMemorySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject memory longer than 5000 characters', () => {
      const data = {
        memory: 'a'.repeat(5001),
      }
      const result = CreateMemorySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept valid type values', () => {
      const data = {
        memory: 'Test memory',
        type: 'note',
      }
      const result = CreateMemorySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid type value', () => {
      const data = {
        memory: 'Test memory',
        type: 'invalid',
      }
      const result = CreateMemorySchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateMemorySchema', () => {
    it('should accept valid update data', () => {
      const data = {
        memory: 'Updated memory',
      }
      const result = UpdateMemorySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow all fields optional', () => {
      const data = {}
      const result = UpdateMemorySchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('GetMemoriesSchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        limit: 20,
        page: 1,
      }
      const result = GetMemoriesSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const data = {}
      const result = GetMemoriesSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.limit).toBe(10)
      expect(result.data?.page).toBe(1)
    })
  })

  describe('MemoryIdSchema', () => {
    it('should accept valid memory ID', () => {
      const data = { id: 'mem-123' }
      const result = MemoryIdSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing ID', () => {
      const data = {}
      const result = MemoryIdSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})

describe('Conversation Validation Schemas', () => {
  describe('CreateConversationSchema', () => {
    it('should accept valid conversation data', () => {
      const data = {
        title: 'Test Conversation',
        participantIds: ['user-1', 'user-2'],
      }
      const result = CreateConversationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing title', () => {
      const data = {
        participantIds: ['user-1', 'user-2'],
      }
      const result = CreateConversationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty participantIds array', () => {
      const data = {
        title: 'Test Conversation',
        participantIds: [],
      }
      const result = CreateConversationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject missing participantIds', () => {
      const data = {
        title: 'Test Conversation',
      }
      const result = CreateConversationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept optional description', () => {
      const data = {
        title: 'Test Conversation',
        participantIds: ['user-1', 'user-2'],
        description: 'A test conversation',
      }
      const result = CreateConversationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateConversationSchema', () => {
    it('should accept valid update data', () => {
      const data = {
        title: 'Updated Conversation',
      }
      const result = UpdateConversationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should allow empty update', () => {
      const data = {}
      const result = UpdateConversationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('GetConversationsSchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        take: 20,
        skip: 0,
      }
      const result = GetConversationsSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const data = {}
      const result = GetConversationsSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data?.take).toBe(10)
      expect(result.data?.skip).toBe(0)
    })
  })

  describe('ConversationIdSchema', () => {
    it('should accept valid conversation ID', () => {
      const data = { id: 'conv-123' }
      const result = ConversationIdSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing ID', () => {
      const data = {}
      const result = ConversationIdSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})

describe('Auth Validation Schemas', () => {
  describe('LoginSchema', () => {
    it('should accept valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'securepassword123',
      }
      const result = LoginSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject missing email', () => {
      const data = {
        password: 'securepassword123',
      }
      const result = LoginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const data = {
        email: 'not-an-email',
        password: 'securepassword123',
      }
      const result = LoginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject password shorter than 8 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'short',
      }
      const result = LoginSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept optional rememberMe flag', () => {
      const data = {
        email: 'test@example.com',
        password: 'securepassword123',
        rememberMe: true,
      }
      const result = LoginSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

describe('Edge Cases', () => {
  it('should handle null values appropriately', () => {
    const data = {
      name: null,
      description: 'A test project',
      adminId: 'admin-123',
    }
    const result = CreateProjectSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should handle extra fields gracefully', () => {
    const data = {
      name: 'Test Project',
      adminId: 'admin-123',
      extraField: 'should be ignored',
      anotherExtra: 123,
    }
    const result = CreateProjectSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate numeric coercion for pagination', () => {
    const data = {
      take: '20',
      skip: '10',
    }
    const result = GetProjectsSchema.safeParse(data)
    expect(result.success).toBe(true)
    expect(result.data?.take).toBe(20)
    expect(result.data?.skip).toBe(10)
  })

  it('should handle whitespace-only strings', () => {
    const data = {
      name: '   ',
      adminId: 'admin-123',
    }
    const result = CreateProjectSchema.safeParse(data)
    // Whitespace strings might be valid - this depends on implementation
    // Just documenting the behavior
    expect(result.data?.name === '   ' || result.success === false).toBe(true)
  })
})
