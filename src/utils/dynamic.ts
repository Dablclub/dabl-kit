import { MiddlewarePayload } from '@/types/dynamic'
import { UserProfile } from '@dynamic-labs/types'

export function getDynamicCredentials(user: UserProfile) {
  const emailCredentials = user.verifiedCredentials
    .filter((cred) => cred.format === 'email')
    .map((cred) => cred.email)

  const embeddedWallets = user.verifiedCredentials
    .filter((cred) => cred.walletProvider === 'embeddedWallet')
    .map((cred) => cred.address)

  const externalWallets = user.verifiedCredentials
    .filter(
      (cred) =>
        cred.chain === 'eip155' && cred.walletProvider !== 'embeddedWallet',
    )
    .map((cred) => cred.address)

  // console.log('Verified emails:', emailCredentials)
  // console.log('Embedded wallets:', embeddedWallets)
  // console.log('External wallets:', externalWallets)

  if (!emailCredentials[0] || !embeddedWallets[0] || !externalWallets[0]) {
    console.error('Missing credentials, please check Dynamic/onchainProvider')
    return {
      email: '',
      appWallet: '',
      extWallet: '',
    }
  }

  return {
    email: emailCredentials[0],
    appWallet: embeddedWallets[0],
    extWallet: externalWallets[0],
  }
}

export function getDynamicCredentialsFromPayload(payload: MiddlewarePayload) {
  const emailCredentials = payload.verified_credentials
    .filter((cred) => cred.format === 'email')
    .map((cred) => cred.email)

  const embeddedWallets = payload.verified_credentials
    .filter((cred) => cred.wallet_provider === 'embeddedWallet')
    .map((cred) => cred.address)

  const externalWallets = payload.verified_credentials
    .filter(
      (cred) =>
        cred.chain === 'eip155' && cred.wallet_provider !== 'embeddedWallet',
    )
    .map((cred) => cred.address)

  return {
    email: emailCredentials[0],
    appWallet: embeddedWallets[0],
    extWallet: externalWallets[0],
  }
}
