'use client'

import { type Dispatch, type SetStateAction } from 'react'
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
type AuthButtonProps = {
  buttonText?: string
  className?: string
  setIsMenuOpen?: Dispatch<SetStateAction<boolean>>
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined
}

export default function AuthButton({
  buttonText = 'Login',
  className,
  size = 'default',
  setIsMenuOpen,
}: AuthButtonProps) {
  const { handleLogOut, setShowAuthFlow, sdkHasLoaded } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const router = useRouter()

  function login() {
    if (!isLoggedIn) {
      setShowAuthFlow(true)
    } else {
      toast.warning('ya cuentas con una sesión activa')
    }
  }
  async function logout() {
    await handleLogOut()
    router.push('/')
    setIsMenuOpen?.(false)
  }

  if (!sdkHasLoaded) {
    return null
  }

  return (
    <Button
      onClick={isLoggedIn ? logout : login}
      size={size}
      className={cn('font-medium', className)}
    >
      {isLoggedIn ? 'Logout' : buttonText}
    </Button>
  )
}

