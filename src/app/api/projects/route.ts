import { NextResponse } from 'next/server'
import prisma from '@/server/prismaClient'
import { searchProjects } from '@/server/controllers/projects'
import { validateQueryParams, validateRequestBody } from '@/lib/validateRequest'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { NotFoundError, ServerError } from '@/lib/errors'
import { GetProjectsSchema, CreateProjectSchema } from '@/validation/projects'

export async function GET(request: Request) {
  try {
    // Validate query parameters
    const result = await validateQueryParams(request, GetProjectsSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const { take, skip, cursor, orderBy, direction, query } = result.data

    if (query) {
      const projects = await searchProjects(query)
      return successResponse({ projects })
    }

    const projects = await prisma.project.findMany({
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
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
    })

    const total = await prisma.project.count()
    const hasMore = skip + take < total

    return paginatedResponse(projects, {
      total,
      hasMore,
      nextCursor: hasMore ? projects[projects.length - 1]?.id : undefined,
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return errorResponse(
      new ServerError('Failed to fetch projects'),
      500,
    )
  }
}

export async function POST(request: Request) {
  try {
    // Validate request body
    const result = await validateRequestBody(request, CreateProjectSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const data = result.data

    const project = await prisma.project.create({
      data,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
    })

    return successResponse(project, 201)
  } catch (error) {
    console.error('Failed to create project:', error)
    return errorResponse(
      new ServerError('Failed to create project'),
      500,
    )
  }
}

