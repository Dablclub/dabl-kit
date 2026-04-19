import { NextResponse } from 'next/server'
import prisma from '@/server/prismaClient'
import { createUser } from '@/server/controllers/users'
import { validateQueryParams, validateRequestBody } from '@/lib/validateRequest'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { NotFoundError, ServerError, ValidationError } from '@/lib/errors'
import { GetUsersSchema, CreateUserSchema, UpdateUserSchema } from '@/validation/users'

export async function GET(request: Request) {
  try {
    // Validate query parameters
    const result = await validateQueryParams(request, GetUsersSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const { take, skip, cursor, orderBy, direction } = result.data

    const users = await prisma.user.findMany({
      take,
      skip,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
      }),
      orderBy: {
        [orderBy]: direction,
      },
      include: {
        profile: true,
      },
    })

    // Get total count for pagination
    const total = await prisma.user.count()
    const hasMore = skip + take < total

    return paginatedResponse(users, {
      total,
      hasMore,
      nextCursor: hasMore ? users[users.length - 1]?.id : undefined,
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return errorResponse(
      new ServerError('Failed to fetch users'),
      500,
    )
  }
}

export async function POST(req: Request) {
  try {
    // Validate request body
    const result = await validateRequestBody(req, CreateUserSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const data = result.data
    const user = await createUser(data)
    return successResponse({ user }, 201)
  } catch (error) {
    console.error('error in back-end /api/users POST route:', error)
    return errorResponse(
      new ServerError('Failed to create user'),
      500,
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse(
        new ValidationError('User ID is required'),
        400,
      )
    }

    // Validate request body
    const result = await validateRequestBody(req, UpdateUserSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const data = result.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return errorResponse(
        new NotFoundError('User'),
        404,
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    return successResponse({ user })
  } catch (error) {
    console.error('error in back-end /api/users PUT route:', error)
    return errorResponse(
      new ServerError('Failed to update user'),
      500,
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse(
        new ValidationError('User ID is required'),
        400,
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return errorResponse(
        new NotFoundError('User'),
        404,
      )
    }

    const deletedUser = await prisma.user.delete({
      where: { id },
    })

    return successResponse({
      user: deletedUser,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('error in back-end /api/users DELETE route:', error)
    return errorResponse(
      new ServerError('Failed to delete user'),
      500,
    )
  }
}

