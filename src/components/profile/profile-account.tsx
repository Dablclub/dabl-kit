'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserWithProfile } from '@/types/db'
import { truncateAddress } from '@/utils/wallet'
import { Wallet } from 'lucide-react'
import { Address } from 'viem'
import { UserForm } from '../forms/user-form'

interface ProfileAccountProps {
  user: UserWithProfile
}

export function ProfileAccount({ user }: ProfileAccountProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <UserForm user={user} />
        </div>

        <div className="flex flex-col justify-center gap-2">
          <p>Carteras:</p>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span>
              App: {truncateAddress({ address: user.appWallet as Address })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span>
              Externa: {truncateAddress({ address: user.extWallet as Address })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

