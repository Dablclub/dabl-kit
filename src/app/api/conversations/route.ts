import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Fetching conversations...')
    
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    console.log('Fetched conversations:', conversations)
    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
} 