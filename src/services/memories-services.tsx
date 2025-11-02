import { Memory } from '@prisma/client'

interface GetMemoriesParams {
  page?: number
  limit?: number
  userId?: string
  query?: string
}

interface GetMemoriesResponse {
  memories: Memory[]
  metadata: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export async function getMemories(
  params?: GetMemoriesParams,
  authToken?: string,
): Promise<GetMemoriesResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.userId) searchParams.set('userId', params.userId)
    if (params?.query) searchParams.set('query', params.query)

    const response = await fetch(`/api/memories?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch memories')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getMemories service:', error)
    throw new Error('Failed to fetch memories')
  }
}

export async function getMemoryById(
  id: string,
  authToken?: string,
): Promise<{ memory: Memory }> {
  try {
    const response = await fetch(`/api/memories/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch memory')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getMemoryById service:', error)
    throw new Error('Failed to fetch memory')
  }
}

export async function getMemoriesByUserId(
  userId: string,
  params?: { page?: number; limit?: number },
  authToken?: string,
): Promise<GetMemoriesResponse> {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('userId', userId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/memories?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch user memories')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getMemoriesByUserId service:', error)
    throw new Error('Failed to fetch user memories')
  }
}

export async function createMemory({
  memory,
  userId,
  authToken,
}: {
  memory: Omit<Omit<Memory, 'updatedAt'>, 'userId'>
  userId?: string
  authToken?: string
}): Promise<Memory> {
  try {
    const response = await fetch('/api/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ memory, userId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create memory')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in createMemory service:', error)
    throw new Error('Failed to create memory')
  }
}

export async function updateMemory({
  id,
  data,
  authToken,
}: {
  id: string
  data: Partial<Omit<Memory, 'userId' | 'updatedAt'>>
  authToken?: string
}): Promise<Memory> {
  try {
    const response = await fetch(`/api/memories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update memory')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in updateMemory service:', error)
    throw new Error('Failed to update memory')
  }
}

export async function deleteMemory(
  id: string,
  options?: { soft?: boolean },
  authToken?: string,
): Promise<void> {
  try {
    const url = options?.soft
      ? `/api/memories/${id}?soft=true`
      : `/api/memories/${id}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete memory')
    }
  } catch (error) {
    console.error('Error in deleteMemory service:', error)
    throw new Error('Failed to delete memory')
  }
}

export async function updateMemoryVisibility({
  id,
  visibility,
  authToken,
}: {
  id: string
  visibility: string
  authToken?: string
}): Promise<Memory> {
  try {
    const response = await fetch(`/api/memories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ visibility }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update memory visibility')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in updateMemoryVisibility service:', error)
    throw new Error('Failed to update memory visibility')
  }
}

export async function searchMemories({
  query,
  userId,
  page = 1,
  limit = 10,
  authToken,
}: {
  query: string
  userId?: string
  page?: number
  limit?: number
  authToken?: string
}): Promise<GetMemoriesResponse> {
  try {
    const searchParams = new URLSearchParams()
    searchParams.set('query', query)
    if (userId) searchParams.set('userId', userId)
    searchParams.set('page', page.toString())
    searchParams.set('limit', limit.toString())

    const response = await fetch(`/api/memories?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to search memories')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in searchMemories service:', error)
    throw new Error('Failed to search memories')
  }
}

