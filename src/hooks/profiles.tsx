import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Profile } from '@prisma/client'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'
import {
  createProfile,
  deleteProfile,
  getProfileByUserId,
  getProfiles,
  updateProfile,
  updateProfileSocials,
} from '@/services/profiles'

interface ProfilesParams {
  query?: string
  take?: number
  skip?: number
}

interface UpdateSocialsData {
  discordUsername?: string | null
  farcasterId?: number | null
  farcasterUsername?: string | null
  githubUsername?: string | null
  xUsername?: string | null
  telegramUsername?: string | null
}

// Profile hooks
export function useProfiles(params?: ProfilesParams) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['profiles', params],
    queryFn: () => getProfiles(params, authToken),
  })
}

export function useProfile(userId?: string) {
  const authToken = getAuthToken()
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      return getProfileByUserId(userId, authToken)
    },
    enabled: Boolean(userId),
  })
}

export function useCreateProfile() {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: Partial<Profile>
    }) => createProfile({ userId, data, authToken }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export function useUpdateProfile(userId: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Profile>) =>
      updateProfile({ userId, data, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export function useUpdateProfileSocials(userId: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSocialsData) =>
      updateProfileSocials({ userId, data, authToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export function useDeleteProfile(userId: string) {
  const authToken = getAuthToken()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteProfile(userId, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}
