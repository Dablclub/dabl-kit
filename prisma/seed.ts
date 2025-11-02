import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First create a test user
  const user = await prisma.user.create({
    data: {
      username: 'test-user',
      displayName: 'Test User',
    }
  })

  // Create test conversations
  const conversations = await Promise.all([
    prisma.conversation.create({
      data: {
        sessionId: 'test-session-1',
        content: 'This is a test conversation about AI and blockchain.',
        title: 'AI and Blockchain Discussion',
        summary: 'Discussion about integrating AI with blockchain technology',
        category: 'tech',
        participants: {
          create: {
            role: 'MEMBER',
            userId: user.id,
            messageCount: 1
          }
        }
      }
    }),
    prisma.conversation.create({
      data: {
        sessionId: 'test-session-2',
        content: 'Exploring the future of decentralized AI systems.',
        title: 'Future of Decentralized AI',
        summary: 'Overview of decentralized AI possibilities',
        category: 'research',
        participants: {
          create: {
            role: 'MEMBER',
            userId: user.id,
            messageCount: 1
          }
        }
      }
    })
  ])

  console.log('Created conversations:', conversations)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
