import { Memory } from '@prisma/client'
import prisma from '../prismaClient'
import { Prisma } from '@prisma/client'

/**
 * Get all memories with optional pagination
 */
export async function getAllMemories(params?: {
  page?: number
  limit?: number
  userId?: string
}) {
  try {
    const where = params?.userId ? { userId: params.userId } : {}

    const memories = await prisma.memory.findMany({
      where,
      skip: ((params?.page ?? 1) - 1) * (params?.limit ?? 10),
      take: params?.limit ?? 10,
      orderBy: {
        createdAt: 'desc',
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

    const total = await prisma.memory.count({ where })

    return {
      memories,
      metadata: {
        total,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        pages: Math.ceil(total / (params?.limit ?? 10)),
      },
    }
  } catch (error) {
    console.error('Error in getAllMemories:', error)
    throw new Error('Failed to get memories')
  }
}

/**
 * Get a memory by ID
 */
export async function getMemoryById(id: string) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id },
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
    return memory
  } catch (error) {
    console.error('Error in getMemoryById:', error)
    throw new Error('Failed to get memory')
  }
}

/**
 * Get memories by user ID
 */
export async function getMemoriesByUserId(
  userId: string,
  params?: { page?: number; limit?: number },
) {
  try {
    const memories = await prisma.memory.findMany({
      where: { userId },
      skip: ((params?.page ?? 1) - 1) * (params?.limit ?? 10),
      take: params?.limit ?? 10,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const total = await prisma.memory.count({ where: { userId } })

    return {
      memories,
      metadata: {
        total,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        pages: Math.ceil(total / (params?.limit ?? 10)),
      },
    }
  } catch (error) {
    console.error('Error in getMemoriesByUserId:', error)
    throw new Error('Failed to get user memories')
  }
}

/**
 * Create a new memory
 */
export async function createMemory(data: {
  memory: Omit<Omit<Memory, 'updatedAt'>, 'userId'>
  userId?: string
}) {
  try {
    const { memory, userId } = data

    // Create a properly typed input object for Prisma
    const createData: Prisma.MemoryCreateInput = {
      id: memory.id,
      startedAt: memory.startedAt,
      finishedAt: memory.finishedAt,
      source: memory.source,
      language: memory.language,
      structured: memory.structured as Prisma.InputJsonValue,
      transcriptSegments: memory.transcriptSegments as Prisma.InputJsonValue,
      geolocation: memory.geolocation as Prisma.InputJsonValue,
      photos: memory.photos,
      pluginsResults: memory.pluginsResults as Prisma.InputJsonValue,
      externalData: memory.externalData as Prisma.InputJsonValue,
      discarded: memory.discarded,
      deleted: memory.deleted,
      visibility: memory.visibility,
      processingMemoryId: memory.processingMemoryId,
      status: memory.status,
      user: {
        connect: { id: userId },
      },
    }

    const newMemory = await prisma.memory.create({
      data: createData,
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

    return newMemory
  } catch (error) {
    console.error('Error in createMemory:', error)
    throw new Error('Failed to create memory')
  }
}

/**
 * Update a memory
 */
export async function updateMemory(params: {
  id: string
  data: Partial<Omit<Memory, 'userId' | 'updatedAt'>>
}) {
  try {
    const { id, data } = params

    // Create a properly typed update object for Prisma
    const updateData: Prisma.MemoryUpdateInput = {}

    // Only copy properties that exist in the data object
    if (data.startedAt !== undefined) updateData.startedAt = data.startedAt
    if (data.finishedAt !== undefined) updateData.finishedAt = data.finishedAt
    if (data.source !== undefined) updateData.source = data.source
    if (data.language !== undefined) updateData.language = data.language
    if (data.structured !== undefined)
      updateData.structured = data.structured as Prisma.InputJsonValue
    if (data.transcriptSegments !== undefined)
      updateData.transcriptSegments =
        data.transcriptSegments as Prisma.InputJsonValue
    if (data.geolocation !== undefined)
      updateData.geolocation = data.geolocation as Prisma.InputJsonValue
    if (data.photos !== undefined) updateData.photos = data.photos
    if (data.pluginsResults !== undefined)
      updateData.pluginsResults = data.pluginsResults as Prisma.InputJsonValue
    if (data.externalData !== undefined)
      updateData.externalData = data.externalData as Prisma.InputJsonValue
    if (data.discarded !== undefined) updateData.discarded = data.discarded
    if (data.deleted !== undefined) updateData.deleted = data.deleted
    if (data.visibility !== undefined) updateData.visibility = data.visibility
    if (data.processingMemoryId !== undefined)
      updateData.processingMemoryId = data.processingMemoryId
    if (data.status !== undefined) updateData.status = data.status

    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: updateData,
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

    return updatedMemory
  } catch (error) {
    console.error('Error in updateMemory:', error)
    throw new Error('Failed to update memory')
  }
}

/**
 * Delete a memory
 */
export async function deleteMemory(id: string) {
  try {
    const deletedMemory = await prisma.memory.delete({
      where: { id },
    })

    return deletedMemory
  } catch (error) {
    console.error('Error in deleteMemory:', error)
    throw new Error('Failed to delete memory')
  }
}

/**
 * Search memories by content
 */
export async function searchMemories(params: {
  query: string
  userId?: string
  page?: number
  limit?: number
}) {
  try {
    const { query, userId, page = 1, limit = 10 } = params

    // Build where clause based on provided parameters
    const where: Prisma.MemoryWhereInput = {
      OR: [
        { source: { contains: query, mode: 'insensitive' } },
        { language: { contains: query, mode: 'insensitive' } },
        { visibility: { contains: query, mode: 'insensitive' } },
      ],
    }

    // Add userId filter if provided
    if (userId) {
      where.userId = userId
    }

    const memories = await prisma.memory.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
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

    const total = await prisma.memory.count({ where })

    return {
      memories,
      metadata: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Error in searchMemories:', error)
    throw new Error('Failed to search memories')
  }
}

/**
 * Soft delete a memory (mark as deleted without removing from database)
 */
export async function softDeleteMemory(id: string) {
  try {
    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        deleted: true,
      },
    })

    return updatedMemory
  } catch (error) {
    console.error('Error in softDeleteMemory:', error)
    throw new Error('Failed to soft delete memory')
  }
}

/**
 * Update memory visibility
 */
export async function updateMemoryVisibility(params: {
  id: string
  visibility: string
}) {
  try {
    const { id, visibility } = params

    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        visibility,
      },
    })

    return updatedMemory
  } catch (error) {
    console.error('Error in updateMemoryVisibility:', error)
    throw new Error('Failed to update memory visibility')
  }
}
