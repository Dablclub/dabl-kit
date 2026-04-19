import { NextResponse } from 'next/server'
import {
  createMemory,
  getAllMemories,
  searchMemories,
} from '@/server/controllers/memories'
import { validateQueryParams, validateRequestBody } from '@/lib/validateRequest'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { ServerError } from '@/lib/errors'
import { GetMemoriesSchema, CreateMemorySchema } from '@/validation/memories'

export async function GET(request: Request) {
  try {
    // Validate query parameters
    const result = await validateQueryParams(request, GetMemoriesSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const { limit, page, userId, query, type, orderBy, direction } = result.data

    if (query) {
      const searchResult = await searchMemories({
        query,
        userId: userId || undefined,
        page,
        limit,
      })
      return successResponse(searchResult)
    }

    const fetchResult = await getAllMemories({
      page,
      limit,
      userId: userId || undefined,
    })

    return successResponse(fetchResult)
  } catch (error) {
    console.error('Failed to fetch memories:', error)
    return errorResponse(
      new ServerError('Failed to fetch memories'),
      500,
    )
  }
}

export async function POST(request: Request) {
  try {
    // Validate request body
    const result = await validateRequestBody(request, CreateMemorySchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const data = result.data

    const newMemory = await createMemory({
      memory: data.memory,
      userId: data.userId
    })
    return successResponse(newMemory, 201)
  } catch (error) {
    console.error('Failed to create memory:', error)
    return errorResponse(
      new ServerError('Failed to create memory'),
      500,
    )
  }
}

