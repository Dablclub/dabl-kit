'use client'

import { Section } from '@/components/layout/section'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileDetails } from '@/components/profile/profile-details'
import { ProfileSocial } from '@/components/profile/profile-social'
import { useUser } from '@/hooks/users'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileAccount } from '@/components/profile/profile-account'

export default function Cuenta() {
  const { user: dynamicUser, sdkHasLoaded } = useDynamicContext()
  const { data: user, error, status } = useUser(dynamicUser?.userId ?? '')

  if (status === 'pending' || !sdkHasLoaded) {
    return (
      <div className="page">
        <Section>
          <div className="container space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </Section>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="page">
        <Section>
          <div className="container space-y-6 text-center">
            <h1 className="text-2xl font-bold">Error loading profile</h1>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div className="page">
      <Section>
        <div className="container flex flex-col gap-y-6">
          <ProfileHeader user={user} />
          <Tabs
            defaultValue="account"
            className="flex w-full flex-col items-center"
          >
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="socials">Socials</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="w-full">
              <ProfileAccount user={user} />
            </TabsContent>
            <TabsContent value="profile" className="w-full">
              <ProfileDetails user={user} />
            </TabsContent>
            <TabsContent value="socials" className="w-full">
              <ProfileSocial user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </div>
  )
}

