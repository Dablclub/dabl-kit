'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserWithProfile } from '@/types/db'
import { SocialsForm } from '../forms/account/socials-form'

interface ProfileSocialProps {
  user: UserWithProfile
}

export function ProfileSocial({ user }: ProfileSocialProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SocialsForm user={user} />
      </CardContent>
    </Card>
  )
}

