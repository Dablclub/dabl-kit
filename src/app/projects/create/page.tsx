'use client'

import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectProfileForm } from '@/components/forms/projects/project-profile-form'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Skeleton } from '@/components/ui/skeleton'

export default function CreateProject() {
  const { user: dynamicUser, sdkHasLoaded } = useDynamicContext()
  const userId = dynamicUser?.userId

  if (!sdkHasLoaded) {
    return (
      <div className="page">
        <Section>
          <Skeleton className="h-64 w-full" />
        </Section>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="page h-[calc(100vh-64px)] pt-32">
        <Section className="container">
          <div className="flex h-full flex-col items-center justify-center">
            <h3 className="text-2xl font-bold">
              You must be logged in to create a project
            </h3>
          </div>
        </Section>
      </div>
    )
  }

  return (
    <div className="page">
      <Section className="container">
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectProfileForm userId={userId} />
          </CardContent>
        </Card>
      </Section>
    </div>
  )
}
