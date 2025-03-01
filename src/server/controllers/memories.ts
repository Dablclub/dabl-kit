import { Prisma } from '@prisma/client'
import prisma from '../prismaClient'

interface TranscriptSegment {
  text: string
  speaker: string
  speakerId: number
  is_user: boolean
  start: number
  end: number
}

interface ActionItem {
  description: string
  completed: boolean
}

interface StructuredData {
  title?: string
  overview?: string
  emoji?: string
  category?: string
  action_items?: ActionItem[]
  events?: unknown[]
}

interface Geolocation {
  google_place_id: string
  latitude: number
  longitude: number
  address: string
  location_type: string
}

interface MemoryInput {
  id: string
  startedAt: Date
  finishedAt: Date
  createdAt?: Date
  source: string
  language: string
  structured?: StructuredData
  transcriptSegments: TranscriptSegment[]
  geolocation: Geolocation
  photos: string[]
  pluginsResults?: unknown
  externalData?: unknown
  discarded: boolean
  deleted: boolean
  visibility: string
  processingMemoryId?: string | null
  status: string
  uid?: string
  title?: string
  overview?: string
  emoji?: string
  category?: string
  events?: unknown
  actionItems?: ActionItem[]
}

// Define a type for the memory record returned from the database
interface MemoryRecord {
  id: string
  [key: string]: unknown
}

/**
 * Creates a new memory record in the database
 */
export async function createMemory({ memory }: { memory: MemoryInput }) {
  try {
    // Extract action items if they exist
    const actionItemDescriptions: string[] = []
    const actionItemCompleted: boolean[] = []

    if (memory.actionItems && memory.actionItems.length > 0) {
      memory.actionItems.forEach((item) => {
        actionItemDescriptions.push(item.description)
        actionItemCompleted.push(item.completed)
      })
    } else if (
      memory.structured?.action_items &&
      memory.structured.action_items.length > 0
    ) {
      memory.structured.action_items.forEach((item) => {
        actionItemDescriptions.push(item.description)
        actionItemCompleted.push(item.completed)
      })
    }

    // Use Prisma's raw query capabilities to create the memory
    // This bypasses TypeScript type checking for fields that might not be in the generated types
    const createdMemory = await prisma.$queryRaw<MemoryRecord[]>`
      INSERT INTO memories (
        id, 
        started_at, 
        finished_at, 
        source, 
        language, 
        transcript_segments, 
        geolocation, 
        photos, 
        plugins_results, 
        external_data, 
        discarded, 
        deleted, 
        visibility, 
        processing_memory_id, 
        status, 
        title, 
        overview, 
        emoji, 
        category, 
        events, 
        "actionItemDescription", 
        "actionItemCompleted",
        user_id,
        created_at,
        updated_at
      ) VALUES (
        ${memory.id},
        ${memory.startedAt},
        ${memory.finishedAt},
        ${memory.source},
        ${memory.language},
        ${JSON.stringify(memory.transcriptSegments)}::jsonb,
        ${JSON.stringify(memory.geolocation)}::jsonb,
        ${memory.photos}::text[],
        ${memory.pluginsResults ? JSON.stringify(memory.pluginsResults) : null}::jsonb,
        ${memory.externalData ? JSON.stringify(memory.externalData) : null}::jsonb,
        ${memory.discarded},
        ${memory.deleted},
        ${memory.visibility},
        ${memory.processingMemoryId},
        ${memory.status},
        ${memory.title || memory.structured?.title || null},
        ${memory.overview || memory.structured?.overview || null},
        ${memory.emoji || memory.structured?.emoji || null},
        ${memory.category || memory.structured?.category || null},
        ${memory.events || memory.structured?.events ? JSON.stringify(memory.events || memory.structured?.events) : null}::jsonb,
        ${actionItemDescriptions}::text[],
        ${actionItemCompleted}::boolean[],
        ${memory.uid || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    return createdMemory[0]
  } catch (error) {
    console.error('Error in createMemory:', error)
    throw new Error('Failed to create memory')
  }
}

/**
 * Retrieves a memory by its ID
 */
export async function getMemoryById(id: string) {
  try {
    const memory = await prisma.memory.findUnique({
      where: { id },
    })
    return memory
  } catch (error) {
    console.error('Error in getMemoryById:', error)
    throw new Error('Failed to get memory')
  }
}

/**
 * Retrieves all memories for a specific user
 */
export async function getMemoriesByUserId(userId: string) {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        userId,
        deleted: false,
        discarded: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return memories
  } catch (error) {
    console.error('Error in getMemoriesByUserId:', error)
    throw new Error('Failed to get memories for user')
  }
}

/**
 * Updates a memory record
 */
export async function updateMemory(id: string, data: Record<string, unknown>) {
  try {
    // Convert the data object to a set of key-value pairs for the SQL query
    const entries = Object.entries(data)
    const setClauses = entries
      .map(([key]) => `"${key}" = $${entries.indexOf([key, data[key]]) + 2}`)
      .join(', ')

    // Use raw query to update the memory
    const updatedMemory = await prisma.$queryRaw<MemoryRecord[]>`
      UPDATE memories
      SET ${Prisma.raw(setClauses)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return updatedMemory[0]
  } catch (error) {
    console.error('Error in updateMemory:', error)
    throw new Error('Failed to update memory')
  }
}

/**
 * Marks a memory as deleted (soft delete)
 */
export async function deleteMemory(id: string) {
  try {
    const deletedMemory = await prisma.$queryRaw<MemoryRecord[]>`
      UPDATE memories
      SET deleted = true, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return deletedMemory[0]
  } catch (error) {
    console.error('Error in deleteMemory:', error)
    throw new Error('Failed to delete memory')
  }
}

/**
 * Permanently removes a memory from the database
 */
export async function permanentlyDeleteMemory(id: string) {
  try {
    const deletedMemory = await prisma.$queryRaw<MemoryRecord[]>`
      DELETE FROM memories
      WHERE id = ${id}
      RETURNING *
    `
    return deletedMemory[0]
  } catch (error) {
    console.error('Error in permanentlyDeleteMemory:', error)
    throw new Error('Failed to permanently delete memory')
  }
}

/**
 * Updates the action items for a memory
 */
export async function updateMemoryActionItems(
  id: string,
  actionItems: ActionItem[],
) {
  try {
    const actionItemDescriptions = actionItems.map((item) => item.description)
    const actionItemCompleted = actionItems.map((item) => item.completed)

    const updatedMemory = await prisma.$queryRaw<MemoryRecord[]>`
      UPDATE memories
      SET "actionItemDescription" = ${actionItemDescriptions}::text[],
          "actionItemCompleted" = ${actionItemCompleted}::boolean[],
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return updatedMemory[0]
  } catch (error) {
    console.error('Error in updateMemoryActionItems:', error)
    throw new Error('Failed to update memory action items')
  }
}

/**
 * Searches memories by content or title
 */
export async function searchMemories(userId: string, query: string) {
  try {
    // Use raw SQL query for text search
    const memories = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT * FROM memories
      WHERE user_id = ${userId}
        AND deleted = false
        AND discarded = false
        AND (
          title ILIKE ${`%${query}%`} OR
          overview ILIKE ${`%${query}%`}
        )
      ORDER BY created_at DESC
    `
    return memories
  } catch (error) {
    console.error('Error in searchMemories:', error)
    throw new Error('Failed to search memories')
  }
}
