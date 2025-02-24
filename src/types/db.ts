import type {
  Prisma,
  User as PrismaUser,
  Profile as PrismaProfile,
} from '@prisma/client'

export type Profile = PrismaProfile

export interface UserWithProfile extends PrismaUser {
  profile?: Profile | null
}

// Type for creating a new user
export type UserCreateInput = Prisma.UserCreateInput

// Type for updating a user
export type UserUpdateInput = Prisma.UserUpdateInput


// Type for user with all relationships
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    profile: true
    communities: {
      include: {
        community: true
      }
    }
    projects: true
    roles: {
      include: {
        role: true
      }
    }
  }
}>
