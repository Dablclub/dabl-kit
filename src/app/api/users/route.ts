import { NextResponse } from 'next/server'
import prisma from '@/server/prismaClient'
import { createUser } from '@/server/controllers/users'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const take = Number(searchParams.get('take')) || 10
  const skip = Number(searchParams.get('skip')) || 0
  const cursor = searchParams.get('cursor')
  const orderBy = searchParams.get('orderBy') || 'id'
  const direction = searchParams.get('direction') || 'desc'

  try {
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
        // Include any relations you need
      },
    })

    // Get total count for pagination
    const total = await prisma.user.count()

    return NextResponse.json({
      users,
      metadata: {
        total,
        hasMore: users.length === take,
        nextCursor: users[users.length - 1]?.id,
      },
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const user = await createUser(data)
    return NextResponse.json(
      {
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.log('error in back-end /api/users POST route:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    const data = await req.json()
    const user = await prisma.user.update({
      where: { id },
      data,
    })
    return NextResponse.json(
      {
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.log('error in back-end /api/users PUT route:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    const deletedUser = await prisma.user.delete({
      where: { id },
    })
    return NextResponse.json(
      {
        user: deletedUser,
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.log('error in back-end /api/users DELETE route:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    )
  }
}

