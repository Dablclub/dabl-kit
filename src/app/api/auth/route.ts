import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/server/controllers/auth'

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
    const user = await getOrCreateUser({
      dynamicUserId,
      appWallet,
      email,
      extWallet,
      username,
    })
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
