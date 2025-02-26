import { Project } from '@prisma/client'
import prisma from '../prismaClient'

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
    })
    return project
  } catch (error) {
    console.error('Error in getProjectById:', error)
    throw new Error('Failed to get project')
  }
}

export async function getProjectByName(name: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { name },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
    })
    return project
  } catch (error) {
    console.error('Error in getProjectByName:', error)
    throw new Error('Failed to get project')
  }
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
) {
  try {
    const project = await prisma.project.create({
      data,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
    })
    return project
  } catch (error) {
    console.error('Error in createProject:', error)
    throw new Error('Failed to create project')
  }
}

export async function updateProject(id: string, data: Partial<Project>) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
    })
    return project
  } catch (error) {
    console.error('Error in updateProject:', error)
    throw new Error('Failed to update project')
  }
}

export async function deleteProject(id: string) {
  try {
    const project = await prisma.project.delete({
      where: { id },
    })
    return project
  } catch (error) {
    console.error('Error in deleteProject:', error)
    throw new Error('Failed to delete project')
  }
}

export async function searchProjects(query: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { projectType: { contains: query, mode: 'insensitive' } },
          { website: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { githubUsername: { contains: query, mode: 'insensitive' } },
          { farcasterUsername: { contains: query, mode: 'insensitive' } },
          { xUsername: { contains: query, mode: 'insensitive' } },
          { telegramUsername: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        badges: true,
        token: true,
      },
    })
    return projects
  } catch (error) {
    console.error('Error in searchProjects:', error)
    throw new Error('Failed to search projects')
  }
}

export async function getProjectsByAdmin(adminId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { adminId },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return projects
  } catch (error) {
    console.error('Error in getProjectsByAdmin:', error)
    throw new Error('Failed to get projects by admin')
  }
}

export async function getProjectsByCommunity(communityId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { communityId },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        community: true,
        quests: true,
        badges: true,
        token: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return projects
  } catch (error) {
    console.error('Error in getProjectsByCommunity:', error)
    throw new Error('Failed to get projects by community')
  }
}
