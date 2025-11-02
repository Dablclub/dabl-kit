import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Project } from '@prisma/client'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  getProjectsByAdmin,
  updateProject,
} from '@/services/projects-services'

interface ProjectsParams {
  take?: number
  skip?: number
  cursor?: string
  orderBy?: string
  direction?: 'asc' | 'desc'
  query?: string
}

// Projects hooks
export function useProjects(params?: ProjectsParams) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const { projects } = await getProjects(params, authToken)
      return projects
    },
  })
}

export function useProject(id?: string) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null
      const { project } = await getProjectById(id, authToken)
      return project
    },
    enabled: Boolean(id),
  })
}

export function useAdminProjects(adminId?: string) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['projects', 'admin', adminId],
    queryFn: async () => {
      if (!adminId) return null
      return getProjectsByAdmin(adminId, authToken)
    },
    enabled: Boolean(adminId),
  })
}

export function useCreateProject() {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
      createProject({ data, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Project>) =>
      updateProject({ id, data, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteProject(id, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

