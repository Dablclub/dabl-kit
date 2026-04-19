import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/prismaClient'
import { validateQueryParams, validateRequestBody } from '@/lib/validateRequest'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { ServerError, ValidationError } from '@/lib/errors'
import { GetConversationsSchema, CreateConversationSchema } from '@/validation/conversations'

export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const result = await validateQueryParams(request, GetConversationsSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const { take, skip, cursor, orderBy, direction, participantId } = result.data

    const conversations = await prisma.conversation.findMany({
      where: participantId ? {
        participants: {
          some: {
            userId: participantId
          }
        }
      } : undefined,
      include: {
        participants: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
          }
        }
      },
      orderBy: {
        [orderBy]: direction,
      },
      take,
      skip,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
      }),
    })

    const total = await prisma.conversation.count()
    const hasMore = skip + take < total

    return paginatedResponse(conversations, {
      total,
      hasMore,
      nextCursor: hasMore ? conversations[conversations.length - 1]?.id : undefined,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return errorResponse(
      new ServerError('Failed to fetch conversations'),
      500,
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const result = await validateRequestBody(request, CreateConversationSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const data = result.data

    // Validate that all participant IDs exist
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: data.participantIds,
        },
      },
    })

    if (participants.length !== data.participantIds.length) {
      return errorResponse(
        new ValidationError('One or more participant IDs do not exist'),
        400,
      )
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: data.title,
        description: data.description,
        participants: {
          create: data.participantIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
          }
        }
      },
    })

    return successResponse(conversation, 201)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return errorResponse(
      new ServerError('Failed to create conversation'),
      500,
    )
  }
} 
