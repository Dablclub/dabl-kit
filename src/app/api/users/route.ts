import { NextResponse } from 'next/server'
import { UserService } from '@/server/services/user.service'

const userService = new UserService()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const user = await userService.getUser(id)
      return NextResponse.json(user)
    }

    const users = await userService.searchUsers(searchParams.get('query') || '')
    return NextResponse.json(users)
  } catch (error) {
    console.log('error in back-end /api/users GET route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const user = await userService.createUser(data)
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
    const user = await userService.updateUser(id, data)
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
    const deletedUser = await userService.deleteUser(id)
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
