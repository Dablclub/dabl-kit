import { Profile } from '@prisma/client'
import prisma from '../prismaClient'

interface CreateProfileParams {
  userId: string
  firstName?: string | null
  lastName?: string | null
  cityRegion?: string | null
  country?: string | null
  primaryRole?: string | null
  professionalProfile?: string | null
  isStudent?: boolean
  discordUsername?: string | null
  farcasterId?: number | null
  farcasterUsername?: string | null
  githubUsername?: string | null
  xUsername?: string | null
  telegramUsername?: string | null
}

export async function getProfileByUserId(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })
    return profile
  } catch (error) {
    console.error('Error in getProfileByUserId:', error)
    throw new Error('Failed to get profile')
  }
}

export async function createProfile(data: CreateProfileParams) {
  try {
    const profile = await prisma.profile.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        cityRegion: data.cityRegion,
        country: data.country,
        primaryRole: data.primaryRole,
        professionalProfile: data.professionalProfile,
        isStudent: data.isStudent,
        discordUsername: data.discordUsername,
        farcasterId: data.farcasterId,
        farcasterUsername: data.farcasterUsername,
        githubUsername: data.githubUsername,
        xUsername: data.xUsername,
        telegramUsername: data.telegramUsername,
      },
    })
    return profile
  } catch (error) {
    console.error('Error in createProfile:', error)
    throw new Error('Failed to create profile')
  }
}

export async function updateProfile(userId: string, data: Partial<Profile>) {
  try {
    // First check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!existingProfile) {
      // If no profile exists, create one
      return createProfile({ userId, ...data })
    }

    // Update existing profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data,
    })

    return updatedProfile
  } catch (error) {
    console.error('Error in updateProfile:', error)
    throw new Error('Failed to update profile')
  }
}

export async function deleteProfile(userId: string) {
  try {
    const deletedProfile = await prisma.profile.delete({
      where: { userId },
    })
    return deletedProfile
  } catch (error) {
    console.error('Error in deleteProfile:', error)
    throw new Error('Failed to delete profile')
  }
}

export async function updateProfileSocials(
  userId: string,
  data: {
    discordUsername?: string | null
    farcasterId?: number | null
    farcasterUsername?: string | null
    githubUsername?: string | null
    xUsername?: string | null
    telegramUsername?: string | null
  },
) {
  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data,
    })
    return updatedProfile
  } catch (error) {
    console.error('Error in updateProfileSocials:', error)
    throw new Error('Failed to update profile socials')
  }
}

export async function getProfileWithUser(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    })
    return profile
  } catch (error) {
    console.error('Error in getProfileWithUser:', error)
    throw new Error('Failed to get profile with user')
  }
}

export async function searchProfiles(query: string) {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { cityRegion: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
          { primaryRole: { contains: query, mode: 'insensitive' } },
          { professionalProfile: { contains: query, mode: 'insensitive' } },
          { discordUsername: { contains: query, mode: 'insensitive' } },
          { farcasterUsername: { contains: query, mode: 'insensitive' } },
          { githubUsername: { contains: query, mode: 'insensitive' } },
          { xUsername: { contains: query, mode: 'insensitive' } },
          { telegramUsername: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })
    return profiles
  } catch (error) {
    console.error('Error in searchProfiles:', error)
    throw new Error('Failed to search profiles')
  }
}

