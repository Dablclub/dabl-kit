import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Memory } from '@prisma/client'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import {
  createMemory,
  deleteMemory,
  getMemories,
  getMemoriesByUserId,
  getMemoryById,
  searchMemories,
  updateMemory,
  updateMemoryVisibility,
} from '@/services/memories-services'

interface MemoriesParams {
  page?: number
  limit?: number
  userId?: string
  query?: string
}

// Memories hooks
export function useMemories(params?: MemoriesParams) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['memories', params],
    queryFn: async () => {
      const result = await getMemories(params, authToken)
      return result
    },
  })
}

export function useMemory(id?: string) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['memory', id],
    queryFn: async () => {
      if (!id) return null
      const { memory } = await getMemoryById(id, authToken)
      return memory
    },
    enabled: Boolean(id),
  })
}

export function useUserMemories(
  userId?: string,
  params?: { page?: number; limit?: number },
) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['memories', 'user', userId, params],
    queryFn: async () => {
      if (!userId) return null
      return getMemoriesByUserId(userId, params, authToken)
    },
    enabled: Boolean(userId),
  })
}

export function useSearchMemories(
  query: string,
  userId?: string,
  params?: { page?: number; limit?: number },
) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['memories', 'search', query, userId, params],
    queryFn: async () => {
      if (!query) return null
      return searchMemories({
        query,
        userId,
        page: params?.page,
        limit: params?.limit,
        authToken,
      })
    },
    enabled: Boolean(query),
  })
}

export function useCreateMemory() {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      memory,
      userId,
    }: {
      memory: Omit<Omit<Memory, 'updatedAt'>, 'userId'>
      userId?: string
    }) => createMemory({ memory, userId, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export function useUpdateMemory(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Omit<Memory, 'userId' | 'updatedAt'>>) =>
      updateMemory({ id, data, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] })
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export function useUpdateMemoryVisibility(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visibility: string) =>
      updateMemoryVisibility({ id, visibility, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] })
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export function useDeleteMemory(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options?: { soft?: boolean }) =>
      deleteMemory(id, options, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory', id] })
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

