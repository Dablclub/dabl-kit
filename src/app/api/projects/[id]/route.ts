import { NextRequest } from 'next/server'
import {
  deleteProject,
  getProjectById,
  updateProject,
} from '@/server/controllers/projects'
import { validateRequestBody } from '@/lib/validateRequest'
import { successResponse, errorResponse } from '@/lib/api-response'
import { NotFoundError, ServerError, ValidationError } from '@/lib/errors'
import { UpdateProjectSchema, ProjectIdSchema } from '@/validation/projects'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    // Validate ID
    const idResult = ProjectIdSchema.safeParse({ id })
    if (!idResult.success) {
      return errorResponse(
        new ValidationError('Invalid project ID'),
        400,
      )
    }

    const project = await getProjectById(id)

    if (!project) {
      return errorResponse(
        new NotFoundError('Project'),
        404,
      )
    }

    return successResponse({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return errorResponse(
      new ServerError('Failed to fetch project'),
      500,
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    // Validate ID
    const idResult = ProjectIdSchema.safeParse({ id })
    if (!idResult.success) {
      return errorResponse(
        new ValidationError('Invalid project ID'),
        400,
      )
    }

    // Validate request body
    const result = await validateRequestBody(request, UpdateProjectSchema)
    if (!result.success) {
      return errorResponse(result.error, 400)
    }

    const data = result.data

    // Check if project exists
    const existingProject = await getProjectById(id)
    if (!existingProject) {
      return errorResponse(
        new NotFoundError('Project'),
        404,
      )
    }

    const project = await updateProject(id, data)
    return successResponse(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return errorResponse(
      new ServerError('Failed to update project'),
      500,
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    // Validate ID
    const idResult = ProjectIdSchema.safeParse({ id })
    if (!idResult.success) {
      return errorResponse(
        new ValidationError('Invalid project ID'),
        400,
      )
    }

    // Check if project exists
    const existingProject = await getProjectById(id)
    if (!existingProject) {
      return errorResponse(
        new NotFoundError('Project'),
        404,
      )
    }

    const deletedProject = await deleteProject(id)
    return successResponse({
      message: 'Project deleted successfully',
      project: deletedProject,
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return errorResponse(
      new ServerError('Failed to delete project'),
      500,
    )
  }
}

