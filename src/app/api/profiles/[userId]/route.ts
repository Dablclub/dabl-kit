import { NextRequest, NextResponse } from 'next/server'
import {
  createProfile,
  deleteProfile,
  getProfileWithUser,
  updateProfile,
} from '@/server/controllers/profiles'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    const profile = await getProfileWithUser(userId)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }
}

export async function POST(
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

    if (!data) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 },
      )
    }

    const profile = await createProfile({ userId, ...data })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 },
    )
  }
}

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

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 },
      )
    }

    const profile = await updateProfile(userId, data)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      )
    }

    const deletedProfile = await deleteProfile(userId)
    return NextResponse.json(
      {
        message: 'Profile deleted successfully',
        profile: deletedProfile,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 },
    )
  }
}

