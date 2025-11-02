import { MiddlewarePayload } from '@/types/dynamic'
import { UserProfile } from '@dynamic-labs/types'

export function getDynamicCredentials(user: UserProfile) {
  const [email] = user.verifiedCredentials
    .filter((cred) => cred.format === 'email')
    .map((cred) => cred.email)

  const [appWallet] = user.verifiedCredentials
    .filter((cred) => cred.walletProvider === 'embeddedWallet')
    .map((cred) => cred.address)

  const [extWallet] = user.verifiedCredentials
    .filter(
      (cred) =>
        cred.chain === 'eip155' && cred.walletProvider !== 'embeddedWallet',
    )
    .map((cred) => cred.address)

  // console.log('Verified emails:', emailCredentials)
  // console.log('Embedded wallets:', embeddedWallets)
  // console.log('External wallets:', externalWallets)

  // if (!emailCredentials[0] || !embeddedWallet || !externalWallet) {
  //   console.error('Missing credentials, please check Dynamic/onchainProvider')
  // }

  return {
    email,
    appWallet,
    extWallet,
  }
}

export function getDynamicCredentialsFromPayload(payload: MiddlewarePayload) {
  const [email] = payload.verified_credentials
    .filter((cred) => cred.format === 'email')
    .map((cred) => cred.email)

  const [appWallet] = payload.verified_credentials
    .filter((cred) => cred.wallet_provider === 'embeddedWallet')
    .map((cred) => cred.address)

  const [extWallet] = payload.verified_credentials
    .filter(
      (cred) =>
        cred.chain === 'eip155' && cred.wallet_provider !== 'embeddedWallet',
    )
    .map((cred) => cred.address)

  return {
    email,
    appWallet,
    extWallet,
  }
}

