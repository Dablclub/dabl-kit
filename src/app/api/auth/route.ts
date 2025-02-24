import prisma from '@/server/prismaClient'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { dynamicUserId, appWallet, email, extWallet, username } =
    await req.json()
  if (!dynamicUserId) {
    return NextResponse.json(
      { error: 'dynamicUserId is required' },
      { status: 400 },
    )
  }
  try {
    let user = await prisma.user.findFirst({
      where: {
        id: dynamicUserId,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: dynamicUserId,
          appWallet,
          displayName: username,
          email,
          extWallet,
          username,
        },
      })
    }
    return NextResponse.json(
      {
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to get or create account' },
      { status: 500 },
    )
  }
}
