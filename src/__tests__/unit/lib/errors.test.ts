import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  isAppError,
  getErrorStatus,
  getErrorMessage,
  getErrorCode,
} from '@/lib/errors'

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with status code, message, and code', () => {
      const error = new AppError(400, 'Bad request', 'BAD_REQUEST')
      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Bad request')
      expect(error.code).toBe('BAD_REQUEST')
      expect(error.name).toBe('AppError')
    })

    it('should maintain proper prototype chain for instanceof checks', () => {
      const error = new AppError(400, 'Test', 'TEST')
      expect(error instanceof AppError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError with 400 status and validation details', () => {
      const details = { email: ['Invalid email format'] }
      const error = new ValidationError('Validation failed', details)
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual(details)
    })

    it('should create ValidationError without details', () => {
      const error = new ValidationError('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.details).toBeUndefined()
    })
  })

  describe('AuthError', () => {
    it('should create AuthError with 401 status', () => {
      const error = new AuthError('Token expired')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTH_ERROR')
      expect(error.message).toBe('Token expired')
    })

    it('should use default message when none provided', () => {
      const error = new AuthError()
      expect(error.message).toBe('Authentication required')
    })
  })

  describe('UnauthorizedError', () => {
    it('should create UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Invalid credentials')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.message).toBe('Invalid credentials')
    })

    it('should use default message when none provided', () => {
      const error = new UnauthorizedError()
      expect(error.message).toBe('Unauthorized')
    })
  })

  describe('ForbiddenError', () => {
    it('should create ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access denied')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
      expect(error.message).toBe('Access denied')
    })

    it('should use default message when none provided', () => {
      const error = new ForbiddenError()
      expect(error.message).toBe('Forbidden')
    })
  })

  describe('NotFoundError', () => {
    it('should create NotFoundError with 404 status and resource name', () => {
      const error = new NotFoundError('User')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('User not found')
    })

    it('should use default resource name when none provided', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
    })
  })

  describe('ConflictError', () => {
    it('should create ConflictError with 409 status', () => {
      const error = new ConflictError('User already exists')
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('CONFLICT')
      expect(error.message).toBe('User already exists')
    })
  })

  describe('RateLimitError', () => {
    it('should create RateLimitError with 429 status', () => {
      const error = new RateLimitError(60)
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(error.retryAfter).toBe(60)
    })

    it('should use custom message and default retryAfter', () => {
      const error = new RateLimitError(undefined, 'Custom rate limit message')
      expect(error.message).toBe('Custom rate limit message')
      expect(error.statusCode).toBe(429)
    })
  })

  describe('ServerError', () => {
    it('should create ServerError with 500 status', () => {
      const error = new ServerError('Database connection failed')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
      expect(error.message).toBe('Database connection failed')
    })

    it('should use default message when none provided', () => {
      const error = new ServerError()
      expect(error.message).toBe('Internal server error')
    })
  })

  describe('Error utility functions', () => {
    it('isAppError should return true for AppError instances', () => {
      const error = new ValidationError('Test')
      expect(isAppError(error)).toBe(true)
    })

    it('isAppError should return false for regular Errors', () => {
      const error = new Error('Regular error')
      expect(isAppError(error)).toBe(false)
    })

    it('getErrorStatus should return status code for AppError', () => {
      const error = new NotFoundError('User')
      expect(getErrorStatus(error)).toBe(404)
    })

    it('getErrorStatus should return 500 for non-AppError', () => {
      const error = new Error('Regular error')
      expect(getErrorStatus(error)).toBe(500)
    })

    it('getErrorMessage should extract message from Error', () => {
      const error = new Error('Test message')
      expect(getErrorMessage(error)).toBe('Test message')
    })

    it('getErrorMessage should handle string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error')
    })

    it('getErrorMessage should handle unknown errors', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred')
    })

    it('getErrorCode should return code for AppError', () => {
      const error = new ValidationError('Test')
      expect(getErrorCode(error)).toBe('VALIDATION_ERROR')
    })

    it('getErrorCode should return UNKNOWN_ERROR for non-AppError', () => {
      const error = new Error('Regular error')
      expect(getErrorCode(error)).toBe('UNKNOWN_ERROR')
    })
  })
})
