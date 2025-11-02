import { NextResponse } from 'next/server'
import prisma from '@/server/prismaClient'
import { searchProjects } from '@/server/controllers/projects'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const take = Number(searchParams.get('take')) || 10
  const skip = Number(searchParams.get('skip')) || 0
  const cursor = searchParams.get('cursor')
  const orderBy = searchParams.get('orderBy') || 'createdAt'
  const direction = searchParams.get('direction') || 'desc'
  const query = searchParams.get('query')

  try {
    if (query) {
      const projects = await searchProjects(query)
      return NextResponse.json({ projects })
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

    return NextResponse.json({
      projects,
      metadata: {
        total,
        hasMore,
        nextCursor: hasMore ? projects[projects.length - 1]?.id : undefined,
      },
    })
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
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

    return NextResponse.json(project)
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    )
  }
}

