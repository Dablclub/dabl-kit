// interface NameService {
// Currently empty, but included for potential future properties
// }

interface WalletProperties {
  turnkeySubOrganizationId?: string
  turnkeyHDWalletId?: string
  isAuthenticatorAttached: boolean
  turnkeyUserId?: string
  isSessionKeyCompatible: boolean
  version: string
  ecdsaProviderType: string | null
  entryPointVersion: string | null
  kernelVersion: string | null
}

interface VerifiedCredential {
  id: string
  format: 'blockchain' | 'email'
  signInEnabled: boolean

  // Blockchain-specific properties
  address?: string
  chain?: string
  name_service?: unknown
  public_identifier?: string
  wallet_name?: string
  wallet_provider?: string
  lastSelectedAt?: string
  wallet_properties?: WalletProperties

  // Email-specific properties
  email?: string
}

export interface MiddlewarePayload {
  kid: string
  aud: string
  iss: string
  sub: string
  sid: string
  email: string
  environment_id: string
  lists: unknown[]
  missing_fields: unknown[]
  username: string
  verified_credentials: VerifiedCredential[]
  last_verified_credential_id: string
  first_visit: string
  last_visit: string
  new_user: boolean
  metadata: Record<string, unknown>
  verifiedCredentialsHashes: {
    blockchain: string
    email: string
  }
  iat: number
  exp: number
}
