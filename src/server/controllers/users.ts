import { User } from '@prisma/client'
import prisma from '../prismaClient'

export async function getAllUsers(params?: { page?: number; limit?: number }) {
  try {
    const users = await prisma.user.findMany({
      skip: (params?.page ?? 1) * (params?.limit ?? 10),
      take: params?.limit ?? 10,
    })
    return users
  } catch (error) {
    console.error(error)
    throw new Error('Failed to get all users')
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return user
  } catch (error) {
    console.error(error)
    throw new Error('Failed to get user by id')
  }
}

export async function createUser(
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
) {
  try {
    const newUser = await prisma.user.create({
      data: user,
    })

    return newUser
  } catch (error) {
    console.error(error)
    throw new Error('Failed to create user')
  }
}

export async function updateUser(id: string, user: Partial<User>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: user,
    })
    return updatedUser
  } catch (error) {
    console.error(error)
    throw new Error('Failed to update user')
  }
}

export async function deleteUser(id: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    })
    return deletedUser
  } catch (error) {
    console.error(error)
    throw new Error('Failed to delete user')
  }
}

