import prisma from '@/server/prismaClient'

interface GetOrCreateUserType {
  dynamicUserId: string
  appWallet: string
  email: string
  extWallet: string
  username: string
}

export async function getOrCreateUser({
  dynamicUserId,
  appWallet,
  email,
  extWallet,
  username,
}: GetOrCreateUserType) {
  try {
    let user = await prisma.user.findFirst({
      where: {
        id: dynamicUserId,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: dynamicUserId,
          appWallet,
          displayName: username,
          email,
          extWallet,
          username,
        },
      })
    }
    return user
  } catch (error) {
    console.error(error)
    return null
  }
}
