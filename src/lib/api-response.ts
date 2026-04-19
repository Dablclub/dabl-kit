/**
 * API Response Helpers
 * Provides standardized response formatting for API endpoints
 */

import { NextResponse } from 'next/server'
import {
  isAppError,
  getErrorStatus,
  getErrorMessage,
  getErrorCode,
} from './errors'

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
  status: number
}

/**
 * Validation Error Details
 */
export interface ValidationErrorResponse {
  success: false
  error: string
  code: string
  details?: Record<string, string[]>
  status: 400
}

/**
 * Create a successful response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      status,
    },
    { status },
  )
}

/**
 * Create an error response
 */
export function errorResponse(
  error: unknown,
  defaultStatus: number = 500,
): NextResponse<ApiResponse> {
  const status = getErrorStatus(error) || defaultStatus
  const message = getErrorMessage(error)
  const code = getErrorCode(error)

  // Extract validation details if available
  const details =
    isAppError(error) && 'details' in error ? error.details : undefined

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details && { details }),
      status,
    },
    { status },
  )
}

/**
 * Create a validation error response with details
 */
export function validationErrorResponse(
  message: string,
  details?: Record<string, string[]>,
): NextResponse<ValidationErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
      ...(details && { details }),
      status: 400,
    },
    { status: 400 },
  )
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: {
    total: number
    page?: number
    limit?: number
    hasMore?: boolean
    nextCursor?: string
  },
  status: number = 200,
): NextResponse<
  ApiResponse<{
    items: T[]
    pagination: typeof pagination
  }>
> {
  return NextResponse.json(
    {
      success: true,
      data: {
        items,
        pagination,
      },
      status,
    },
    { status },
  )
}

/**
 * Type helper for successful responses
 */
export type SuccessResponse<T> = ApiResponse<T> & { success: true }

/**
 * Type helper for error responses
 */
export type ErrorResponse = ApiResponse & { success: false }
