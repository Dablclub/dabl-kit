'use client'

import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  DynamicContextProvider,
  DynamicEventsCallbacks,
} from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { createConfig, WagmiProvider } from 'wagmi'
import { Address, http } from 'viem'
import { mainnet, polygon, polygonAmoy } from 'viem/chains'
import { walletConnect } from 'wagmi/connectors'
import { useRouter } from 'next/navigation'
import { getDynamicCredentials } from '@/utils/dynamic'
import { loginUser } from '@/services/auth'

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? ''
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

const config = createConfig({
  chains: [mainnet, polygon, polygonAmoy],
  connectors: [
    walletConnect({
      projectId: walletConnectProjectId,
    }),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    ),
    [polygonAmoy.id]: http(
      `https://polygon-amoy.g.alchemy.com/v2/${alchemyApiKey}`,
    ),
  },
})

const queryClient = new QueryClient()

export default function OnchainProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const events: DynamicEventsCallbacks = {
    onAuthSuccess: async ({ primaryWallet, user }) => {
      const { email, appWallet, extWallet } = getDynamicCredentials(user)

      if (
        !primaryWallet ||
        !user ||
        !user.userId ||
        !user.username ||
        !email ||
        !appWallet ||
        !extWallet
      ) {
        console.error(
          'Missing args from onAuthSuccess event, please check Dynamic/onchainProvider',
        )
        return
      }
      try {
        const fetchedUser = await loginUser({
          dynamicUserId: user.userId,
          appWallet: appWallet as Address,
          extWallet: extWallet as Address,
          email: email as string,
          username: user.username,
        })
        console.log('Succesfully fetched user:', fetchedUser)
        router.push('/account')
      } catch (error) {
        console.error(error)
        console.error('Unable to read/create user, please check the server')
      }
    },
    onLogout: (args) => {
      console.log('onLogout was called', args)
      router.push('/')
    },
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? 'ENV_ID',
        events,
        // TODO: Uncomment this when we have a custom network
        // overrides: {
        //   evmNetworks: (networks) => mergeNetworks(customEvmNetworks, networks),
        // },
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}
