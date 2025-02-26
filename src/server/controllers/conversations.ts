import { Conversation, ParticipantRole } from '@prisma/client'
import prisma from '../prismaClient'

export async function getConversationById(id: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
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
        },
        segments: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })
    return conversation
  } catch (error) {
    console.error('Error in getConversationById:', error)
    throw new Error('Failed to get conversation')
  }
}

export async function getConversationBySessionId(sessionId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { sessionId },
      include: {
        participants: {
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
        },
        segments: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })
    return conversation
  } catch (error) {
    console.error('Error in getConversationBySessionId:', error)
    throw new Error('Failed to get conversation by session ID')
  }
}

export async function createConversation(
  data: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>,
) {
  try {
    const conversation = await prisma.conversation.create({
      data,
      include: {
        participants: true,
        segments: true,
      },
    })
    return conversation
  } catch (error) {
    console.error('Error in createConversation:', error)
    throw new Error('Failed to create conversation')
  }
}

export async function updateConversation(
  id: string,
  data: Partial<Conversation>,
) {
  try {
    const conversation = await prisma.conversation.update({
      where: { id },
      data,
      include: {
        participants: {
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
        },
        segments: true,
      },
    })
    return conversation
  } catch (error) {
    console.error('Error in updateConversation:', error)
    throw new Error('Failed to update conversation')
  }
}

export async function deleteConversation(id: string) {
  try {
    // First delete all segments and participants
    await prisma.conversationSegment.deleteMany({
      where: { conversationId: id },
    })

    await prisma.conversationParticipant.deleteMany({
      where: { conversationId: id },
    })

    // Then delete the conversation
    const conversation = await prisma.conversation.delete({
      where: { id },
    })

    return conversation
  } catch (error) {
    console.error('Error in deleteConversation:', error)
    throw new Error('Failed to delete conversation')
  }
}

export async function addParticipantToConversation(
  conversationId: string,
  userId: string,
  role: ParticipantRole = ParticipantRole.MEMBER,
) {
  try {
    const participant = await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId,
        role,
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
    return participant
  } catch (error) {
    console.error('Error in addParticipantToConversation:', error)
    throw new Error('Failed to add participant to conversation')
  }
}

export async function removeParticipantFromConversation(
  conversationId: string,
  userId: string,
) {
  try {
    // Instead of deleting, we set the leftAt timestamp
    const participant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    })
    return participant
  } catch (error) {
    console.error('Error in removeParticipantFromConversation:', error)
    throw new Error('Failed to remove participant from conversation')
  }
}

export async function updateParticipantRole(
  conversationId: string,
  userId: string,
  role: ParticipantRole,
) {
  try {
    const participant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        role,
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
    return participant
  } catch (error) {
    console.error('Error in updateParticipantRole:', error)
    throw new Error('Failed to update participant role')
  }
}

export async function addSegmentToConversation(
  conversationId: string,
  data: {
    text: string
    speaker: string
    speakerId: number
    isUser: boolean
    startTime: number
    endTime: number
    participantId?: string
  },
) {
  try {
    const segment = await prisma.conversationSegment.create({
      data: {
        ...data,
        conversationId,
      },
    })

    // Update the participant's lastActive time and message count
    if (data.participantId) {
      await prisma.conversationParticipant.update({
        where: { id: data.participantId },
        data: {
          lastActive: new Date(),
          messageCount: {
            increment: 1,
          },
        },
      })
    }

    return segment
  } catch (error) {
    console.error('Error in addSegmentToConversation:', error)
    throw new Error('Failed to add segment to conversation')
  }
}

export async function getConversationsByUserId(userId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
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
        },
        segments: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    return conversations
  } catch (error) {
    console.error('Error in getConversationsByUserId:', error)
    throw new Error('Failed to get conversations by user ID')
  }
}

export async function updateConversationSummary(id: string, summary: string) {
  try {
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { summary },
    })
    return conversation
  } catch (error) {
    console.error('Error in updateConversationSummary:', error)
    throw new Error('Failed to update conversation summary')
  }
}

export async function updateConversationTitle(id: string, title: string) {
  try {
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { title },
    })
    return conversation
  } catch (error) {
    console.error('Error in updateConversationTitle:', error)
    throw new Error('Failed to update conversation title')
  }
}

export async function getActiveParticipants(conversationId: string) {
  try {
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        leftAt: null, // Only get active participants
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
      orderBy: {
        lastActive: 'desc',
      },
    })
    return participants
  } catch (error) {
    console.error('Error in getActiveParticipants:', error)
    throw new Error('Failed to get active participants')
  }
}

export async function searchConversations(query: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          {
            segments: {
              some: { text: { contains: query, mode: 'insensitive' } },
            },
          },
        ],
      },
      include: {
        participants: {
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
        },
        segments: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    return conversations
  } catch (error) {
    console.error('Error in searchConversations:', error)
    throw new Error('Failed to search conversations')
  }
}
