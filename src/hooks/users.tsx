import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User } from '@prisma/client'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '@/services/users'

interface PaginationParams {
  take?: number
  skip?: number
  cursor?: string
  orderBy?: string
  direction?: 'asc' | 'desc'
}

// async function createUser(data: Omit<User, 'createdAt' | 'updatedAt'>) {
//   try {
//     const response = await fetch('/api/users', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     })
//     if (!response.ok) throw new Error('Failed to create user')
//     return response.json()
//   } catch (error) {
//     console.error(error)
//     throw new Error('Failed to create user')
//   }
// }

// async function fetchAllUsers(params?: PaginationParams) {
//   try {
//     const queryParams = new URLSearchParams()
//     if (params?.take) queryParams.set('take', params.take.toString())
//     if (params?.skip) queryParams.set('skip', params.skip.toString())
//     if (params?.cursor) queryParams.set('cursor', params.cursor)
//     if (params?.orderBy) {
//       queryParams.set('orderBy', params.orderBy.field)
//       queryParams.set('direction', params.orderBy.direction)
//     }

//     const response = await fetch(`/api/users?${queryParams.toString()}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//     if (!response.ok) throw new Error('Failed to fetch all users')
//     return response.json()
//   } catch (error) {
//     console.error(error)
//     throw new Error('Failed to fetch all users')
//   }
// }

// async function fetchUserById(id: string, authToken?: string) {
//   if (!authToken) throw new Error('No auth token found')
//   try {
//     const response = await fetch(`/api/users/${id}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${authToken}`,
//       },
//     })
//     if (!response.ok) throw new Error('Failed to fetch user by id')
//     return response.json()
//   } catch (error) {
//     console.error(error)
//     throw new Error('Failed to fetch user by id')
//   }
// }

// async function updateUser(
//   id: string,
//   data: UserUpdateInput,
//   authToken?: string,
// ): Promise<UserWithRelations> {
//   if (!authToken) throw new Error('No auth token found')
//   const response = await fetch(`/api/users/${id}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${authToken}`,
//     },
//     body: JSON.stringify(data),
//   })
//   if (!response.ok) throw new Error('Failed to update user')
//   return response.json()
// }

// async function deleteUser(id: string, authToken?: string): Promise<void> {
//   if (!authToken) throw new Error('No auth token found')
//   const response = await fetch(`/api/users/${id}`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${authToken}`,
//     },
//   })
//   if (!response.ok) throw new Error('Failed to delete user')
// }

// User hooks
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  })
}

export function useUser(id?: string) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      console.log('id', id)
      if (!id) return null
      const user = await getUserById(id, authToken)
      console.log('user', user)
      return user
    },
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<User, 'createdAt' | 'updatedAt'>) =>
      createUser(data, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => updateUser(id, data, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })
}

export function useDeleteUser(id: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteUser(id, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] })
    },
  })
}
