import { User, Profile } from '@prisma/client'

interface GetUsersParams {
  take?: number
  skip?: number
  cursor?: string
  orderBy?: string
  direction?: 'asc' | 'desc'
}

interface GetUsersResponse {
  users: User[]
  metadata: {
    total: number
    hasMore: boolean
    nextCursor?: string
  }
}

interface UpdateProfileParams {
  userId: string
  data: Partial<Profile>
  authToken?: string
}

export async function getUsers(
  params?: GetUsersParams,
  authToken?: string,
): Promise<GetUsersResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.take) searchParams.set('take', params.take.toString())
    if (params?.skip) searchParams.set('skip', params.skip.toString())
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.orderBy) searchParams.set('orderBy', params.orderBy)
    if (params?.direction) searchParams.set('direction', params.direction)

    const response = await fetch(`/api/users?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch users')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getUsers service:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function getUserById(
  id: string,
  authToken?: string,
): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getUserById service:', error)
    throw new Error('Failed to fetch user')
  }
}

export async function updateUser(
  id: string,
  data: Partial<User>,
  authToken?: string,
): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in updateUser service:', error)
    throw new Error('Failed to update user')
  }
}

export async function updateProfile({
  userId,
  data,
  authToken,
}: UpdateProfileParams): Promise<Profile> {
  try {
    const response = await fetch(`/api/users/${userId}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in updateProfile service:', error)
    throw new Error('Failed to update profile')
  }
}

export async function deleteUser(
  id: string,
  authToken?: string,
): Promise<void> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete user')
    }
  } catch (error) {
    console.error('Error in deleteUser service:', error)
    throw new Error('Failed to delete user')
  }
}

export async function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  authToken?: string,
): Promise<User> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create user')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in createUser service:', error)
    throw new Error('Failed to create user')
  }
}
