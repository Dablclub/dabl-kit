import { Project } from '@prisma/client'

interface GetProjectsParams {
  take?: number
  skip?: number
  cursor?: string
  orderBy?: string
  direction?: 'asc' | 'desc'
  query?: string
}

interface GetProjectsResponse {
  projects: Project[]
  metadata: {
    total: number
    hasMore: boolean
    nextCursor?: string
  }
}

export async function getProjects(
  params?: GetProjectsParams,
  authToken?: string,
): Promise<GetProjectsResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.take) searchParams.set('take', params.take.toString())
    if (params?.skip) searchParams.set('skip', params.skip.toString())
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.orderBy) searchParams.set('orderBy', params.orderBy)
    if (params?.direction) searchParams.set('direction', params.direction)
    if (params?.query) searchParams.set('query', params.query)

    const response = await fetch(`/api/projects?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch projects')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getProjects service:', error)
    throw new Error('Failed to fetch projects')
  }
}

export async function getProjectById(
  id: string,
  authToken?: string,
): Promise<{ project: Project }> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch project')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getProjectById service:', error)
    throw new Error('Failed to fetch project')
  }
}

export async function getProjectsByAdmin(
  adminId: string,
  authToken?: string,
): Promise<{ projects: Project[] }> {
  try {
    const response = await fetch(`/api/projects/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch admin projects')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getProjectsByAdmin service:', error)
    throw new Error('Failed to fetch admin projects')
  }
}

export async function createProject({
  data,
  authToken,
}: {
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  authToken?: string
}): Promise<Project> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create project')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in createProject service:', error)
    throw new Error('Failed to create project')
  }
}

export async function updateProject({
  id,
  data,
  authToken,
}: {
  id: string
  data: Partial<Project>
  authToken?: string
}): Promise<Project> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update project')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in updateProject service:', error)
    throw new Error('Failed to update project')
  }
}

export async function deleteProject(
  id: string,
  authToken?: string,
): Promise<void> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete project')
    }
  } catch (error) {
    console.error('Error in deleteProject service:', error)
    throw new Error('Failed to delete project')
  }
}

