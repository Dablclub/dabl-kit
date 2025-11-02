import { Profile } from '@prisma/client'

interface GetProfilesParams {
  query?: string
  take?: number
  skip?: number
}

interface GetProfilesResponse {
  profiles: Profile[]
}

interface UpdateProfileParams {
  userId: string
  data: Partial<Profile>
  authToken?: string
}

interface UpdateSocialsParams {
  userId: string
  data: {
    discordUsername?: string | null
    farcasterId?: number | null
    farcasterUsername?: string | null
    githubUsername?: string | null
    xUsername?: string | null
    telegramUsername?: string | null
  }
  authToken?: string
}

export async function getProfiles(
  params?: GetProfilesParams,
  authToken?: string,
): Promise<GetProfilesResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params?.query) searchParams.set('query', params.query)
    if (params?.take) searchParams.set('take', params.take.toString())
    if (params?.skip) searchParams.set('skip', params.skip.toString())

    const response = await fetch(`/api/profiles?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch profiles')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getProfiles service:', error)
    throw new Error('Failed to fetch profiles')
  }
}

export async function getProfileByUserId(
  userId: string,
  authToken?: string,
): Promise<Profile> {
  try {
    const response = await fetch(`/api/profiles/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in getProfileByUserId service:', error)
    throw new Error('Failed to fetch profile')
  }
}

export async function createProfile({
  userId,
  data,
  authToken,
}: UpdateProfileParams): Promise<Profile> {
  try {
    const response = await fetch(`/api/profiles/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create profile')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in createProfile service:', error)
    throw new Error('Failed to create profile')
  }
}

export async function updateProfile({
  userId,
  data,
  authToken,
}: UpdateProfileParams): Promise<Profile> {
  try {
    const response = await fetch(`/api/profiles/${userId}`, {
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

export async function updateProfileSocials({
  userId,
  data,
  authToken,
}: UpdateSocialsParams): Promise<Profile> {
  try {
    const response = await fetch(`/api/profiles/${userId}/socials`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update profile socials')
    }

    return await response.json()
  } catch (error) {
    console.error('Error in updateProfileSocials service:', error)
    throw new Error('Failed to update profile socials')
  }
}

export async function deleteProfile(
  userId: string,
  authToken?: string,
): Promise<void> {
  try {
    const response = await fetch(`/api/profiles/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete profile')
    }
  } catch (error) {
    console.error('Error in deleteProfile service:', error)
    throw new Error('Failed to delete profile')
  }
}

