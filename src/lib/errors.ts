/**
 * Application Error Classes
 * Defines a hierarchy of error types for consistent error handling
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
  ) {
    super(message)
    this.name = this.constructor.name
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * ValidationError (400)
 * Thrown when request validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR')
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * AuthError (401)
 * Thrown when authentication fails or is missing
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTH_ERROR')
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

/**
 * UnauthorizedError (401)
 * Alias for AuthError - thrown when credentials are invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * ForbiddenError (403)
 * Thrown when user lacks necessary permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

/**
 * NotFoundError (404)
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND')
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * ConflictError (409)
 * Thrown when a request conflicts with existing state
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT')
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * RateLimitError (429)
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(
    public retryAfter?: number,
    message: string = 'Too many requests',
  ) {
    super(429, message, 'RATE_LIMIT_EXCEEDED')
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * ServerError (500)
 * Thrown for unexpected server errors
 */
export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, 'SERVER_ERROR')
    Object.setPrototypeOf(this, ServerError.prototype)
  }
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Get error status code
 */
export function getErrorStatus(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode
  }
  return 500
}

/**
 * Get error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Get error code
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code
  }
  return 'UNKNOWN_ERROR'
}
