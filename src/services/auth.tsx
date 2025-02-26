interface LoginUserParams {
  dynamicUserId: string
  appWallet?: string
  email?: string
  extWallet?: string
  username: string
}

export async function loginUser(data: LoginUserParams) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const user = await response.json()
    return user
  } catch (error) {
    console.error(error)
    throw error
  }
}
