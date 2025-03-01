import { NextRequest, NextResponse } from 'next/server'
import {
  deleteProject,
  getProjectById,
  updateProject,
} from '@/server/controllers/projects'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 },
      )
    }

    const project = await getProjectById(id)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params
    const data = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 },
      )
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 },
      )
    }

    const project = await updateProject(id, data)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 },
      )
    }

    const deletedProject = await deleteProject(id)
    return NextResponse.json(
      {
        message: 'Project deleted successfully',
        project: deletedProject,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 },
    )
  }
}
