import { NextResponse } from 'next/server'
import {
  createMemory,
  getAllMemories,
  searchMemories,
} from '@/server/controllers/memories'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const limit = Number(searchParams.get('limit')) || 10
  const page = Number(searchParams.get('page')) || 1
  const userId = searchParams.get('userId') || undefined
  const query = searchParams.get('query')

  try {
    if (query) {
      const result = await searchMemories({
        query,
        userId: userId || undefined,
        page,
        limit,
      })
      return NextResponse.json(result)
    }

    const result = await getAllMemories({
      page,
      limit,
      userId: userId || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch memories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Extract memory data and userId if provided
    const { memory, userId } = data

    if (!memory) {
      return NextResponse.json(
        { error: 'Memory data is required' },
        { status: 400 },
      )
    }

    const newMemory = await createMemory({ memory, userId })
    return NextResponse.json(newMemory)
  } catch (error) {
    console.error('Failed to create memory:', error)
    return NextResponse.json(
      { error: 'Failed to create memory' },
      { status: 500 },
    )
  }
}

