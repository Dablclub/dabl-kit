'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserWithProfile } from '@/types/db'
import { ProfileForm } from '../forms/account/profile-form'

interface ProfileDetailsProps {
  user: UserWithProfile
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  )
}

