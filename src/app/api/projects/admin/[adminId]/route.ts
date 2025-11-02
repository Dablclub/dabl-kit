import { NextRequest, NextResponse } from 'next/server'
import { getProjectsByAdmin } from '@/server/controllers/projects'

export async function GET(
  _request: NextRequest,
  { params }: { params: { adminId: string } },
) {
  try {
    const { adminId } = params

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 },
      )
    }

    const projects = await getProjectsByAdmin(adminId)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching admin projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin projects' },
      { status: 500 },
    )
  }
}

