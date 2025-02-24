import { NextResponse } from 'next/server'
import { searchProfiles } from '@/server/controllers/profiles'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  try {
    // Use searchProfiles controller for both search and listing
    // since it already includes user data in the response
    const profiles = await searchProfiles(query || '')
    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Failed to fetch profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 },
    )
  }
}
