import { NextRequest, NextResponse } from 'next/server'
import {
  deleteMemory,
  getMemoryById,
  updateMemory,
  softDeleteMemory,
  updateMemoryVisibility,
} from '@/server/controllers/memories'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 },
      )
    }

    const memory = await getMemoryById(id)

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    return NextResponse.json({ memory })
  } catch (error) {
    console.error('Error fetching memory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memory' },
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
        { error: 'Memory ID is required' },
        { status: 400 },
      )
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 },
      )
    }

    // Check if this is a visibility update
    if (data.visibility && Object.keys(data).length === 1) {
      const memory = await updateMemoryVisibility({
        id,
        visibility: data.visibility,
      })
      return NextResponse.json(memory)
    }

    // Regular update
    const memory = await updateMemory({
      id,
      data,
    })
    return NextResponse.json(memory)
  } catch (error) {
    console.error('Error updating memory:', error)
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const soft = searchParams.get('soft') === 'true'

    if (!id) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 },
      )
    }

    // Perform soft delete if requested
    if (soft) {
      const deletedMemory = await softDeleteMemory(id)
      return NextResponse.json(
        {
          message: 'Memory soft deleted successfully',
          memory: deletedMemory,
        },
        { status: 200 },
      )
    }

    // Otherwise perform hard delete
    const deletedMemory = await deleteMemory(id)
    return NextResponse.json(
      {
        message: 'Memory deleted successfully',
        memory: deletedMemory,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting memory:', error)
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 },
    )
  }
}

