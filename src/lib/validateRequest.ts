/**
 * Request Validation Helper
 * Validates incoming requests against Zod schemas
 */

import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from './errors'
import { validationErrorResponse } from './api-response'

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
  error?: ValidationError
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: Request | NextRequest,
  schema: ZodSchema,
): Promise<ValidationResult<T>> {
  try {
    // Parse JSON from request body
    let body: unknown
    try {
      body = await request.json()
    } catch (parseError) {
      return {
        success: false,
        errors: {
          _root: ['Invalid JSON in request body'],
        },
      }
    }

    // Validate against schema
    const result = schema.safeParse(body)

    if (!result.success) {
      // Extract validation errors from Zod
      const errors: Record<string, string[]> = {}
      result.error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })

      const error = new ValidationError('Validation failed', errors)
      return {
        success: false,
        errors,
        error,
      }
    }

    return {
      success: true,
      data: result.data as T,
    }
  } catch (error) {
    return {
      success: false,
      errors: {
        _root: [
          error instanceof Error
            ? error.message
            : 'Unknown validation error',
        ],
      },
    }
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export async function validateQueryParams<T>(
  request: Request | NextRequest,
  schema: ZodSchema,
): Promise<ValidationResult<T>> {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, string | string[]> = {}

    // Convert URLSearchParams to object
    for (const [key, value] of searchParams) {
      if (params[key]) {
        // Handle multiple values for same key
        if (Array.isArray(params[key])) {
          ;(params[key] as string[]).push(value)
        } else {
          params[key] = [params[key] as string, value]
        }
      } else {
        params[key] = value
      }
    }

    // Validate against schema
    const result = schema.safeParse(params)

    if (!result.success) {
      // Extract validation errors from Zod
      const errors: Record<string, string[]> = {}
      result.error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })

      const error = new ValidationError('Query validation failed', errors)
      return {
        success: false,
        errors,
        error,
      }
    }

    return {
      success: true,
      data: result.data as T,
    }
  } catch (error) {
    return {
      success: false,
      errors: {
        _root: [
          error instanceof Error
            ? error.message
            : 'Unknown validation error',
        ],
      },
    }
  }
}

/**
 * Validate and return NextResponse error if validation fails
 */
export async function validateRequestBodyOrError<T>(
  request: Request | NextRequest,
  schema: ZodSchema,
): Promise<T | NextResponse> {
  const result = await validateRequestBody<T>(request, schema)

  if (!result.success) {
    return validationErrorResponse(
      'Validation failed',
      result.errors,
    ) as unknown as NextResponse
  }

  return result.data!
}

/**
 * Validate and return NextResponse error if validation fails
 */
export async function validateQueryParamsOrError<T>(
  request: Request | NextRequest,
  schema: ZodSchema,
): Promise<T | NextResponse> {
  const result = await validateQueryParams<T>(request, schema)

  if (!result.success) {
    return validationErrorResponse(
      'Query validation failed',
      result.errors,
    ) as unknown as NextResponse
  }

  return result.data!
}
