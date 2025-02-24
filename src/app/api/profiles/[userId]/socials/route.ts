import { NextRequest, NextResponse } from 'next/server'
import { updateProfileSocials } from '@/server/controllers/profiles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params
    const data = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    const profile = await updateProfileSocials(userId, data)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile socials:', error)
    return NextResponse.json(
      { error: 'Failed to update profile socials' },
      { status: 500 },
    )
  }
}
