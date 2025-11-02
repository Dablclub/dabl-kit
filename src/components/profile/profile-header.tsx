'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { UserWithProfile } from '@/types/db'
import { UserCircle2, Link as LinkIcon, MapPin } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ProfileHeaderProps {
  user: UserWithProfile
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <Card className="w-full overflow-hidden">
      {/* Banner Section */}
      <div className="relative h-40 w-full sm:h-48">
        {user.bannerUrl ? (
          <Image
            src={user.bannerUrl}
            alt="Profile banner"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-muted via-secondary to-primary" />
        )}
      </div>

      <CardContent className="relative px-4 pb-6 pt-0 sm:px-6">
        {/* Profile Info Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-start sm:flex-row sm:items-end">
            <Avatar className="-mt-12 h-24 w-24 border-4 border-background ring-background sm:-mt-16 sm:h-32 sm:w-32">
              <AvatarImage src={user.avatarUrl ?? ''} />
              <AvatarFallback>
                <UserCircle2 className="h-14 w-14 text-primary/75" />
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2 px-6">
              <div className="sm:mt-0">
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {user.displayName}
                </h1>
                <p className="text-foreground">@{user.username}</p>
              </div>

              <div className="flex flex-col gap-2">
                {user.bio && (
                  <p className="text-base text-muted-foreground">{user.bio}</p>
                )}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  {user.profile?.cityRegion && (
                    <div className="flex items-center gap-1 text-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{user.profile.cityRegion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 self-end sm:self-center">
            {user.website && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

