'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrophyIcon } from 'lucide-react'
import Link from 'next/link'
import {
  getTopMemoryGenerators,
  getTopMemoryCollectors,
  getTopQuestChampions,
} from '@/data/leaderboardData'
import { User } from '@/types/models'

// Define a type for the user with additional leaderboard properties
interface LeaderboardUser extends User {
  change: number
  badges: string[]
}

// Get data from our mock data helpers
const memoryGenerators = getTopMemoryGenerators(10) as LeaderboardUser[]
const memoryCollectors = getTopMemoryCollectors(10) as LeaderboardUser[]
const questChampions = getTopQuestChampions(10) as LeaderboardUser[]

function RankChange({ change }: { change: number }) {
  if (change === 0) {
    return <span className="text-muted-foreground">—</span>
  } else if (change > 0) {
    return <span className="text-green-500">↑{change}</span>
  } else {
    return <span className="text-red-500">↓{Math.abs(change)}</span>
  }
}

type UserRowType = 'generator' | 'collector' | 'quest'

function UserRow({ user, type }: { user: LeaderboardUser; type: UserRowType }) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4 text-center font-medium">
        {user.stats.rank <= 3 ? (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <TrophyIcon
              className={`h-4 w-4 ${
                user.stats.rank === 1
                  ? 'text-yellow-500'
                  : user.stats.rank === 2
                    ? 'text-gray-400'
                    : 'text-amber-600'
              }`}
            />
          </div>
        ) : (
          user.stats.rank
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.displayName}</div>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
      </td>
      {type === 'generator' && (
        <>
          <td className="p-4 text-center">{user.stats.memoriesCreated}</td>
          <td className="p-4 text-center">{user.stats.totalEngagement}</td>
        </>
      )}
      {type === 'collector' && (
        <>
          <td className="p-4 text-center">{user.stats.memoriesSaved}</td>
          <td className="p-4 text-center">{user.stats.categoriesExplored}</td>
        </>
      )}
      {type === 'quest' && (
        <>
          <td className="p-4 text-center">{user.stats.questsCompleted}</td>
          <td className="p-4 text-center">{user.stats.badgesEarned}</td>
          <td className="p-4 text-center">{user.stats.totalRewards}</td>
        </>
      )}
      <td className="p-4">
        <div className="flex flex-wrap gap-1">
          {user.badges.slice(0, 3).map((badge: string) => (
            <Badge key={badge} variant="outline" className="text-xs">
              {badge}
            </Badge>
          ))}
          {user.badges.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{user.badges.length - 3} more
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4 text-center">
        <RankChange change={user.change} />
      </td>
      <td className="p-4 text-right">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/profile/${user.id}`}>View Profile</Link>
        </Button>
      </td>
    </tr>
  )
}

export default function LeaderboardPage() {
  const [, setTimeframe] = useState<'week' | 'month' | 'year' | 'all'>('month')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Community Leaderboard
        </h1>
        <p className="text-xl text-muted-foreground">
          Celebrating our most active and engaged community members
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue="month"
            className="w-[400px]"
            onValueChange={(value) =>
              setTimeframe(value as 'week' | 'month' | 'year' | 'all')
            }
          >
            <TabsList>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button variant="outline" size="sm">
          View Your Rank
        </Button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Top Memory Generators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={memoryGenerators[0].avatarUrl}
                  alt={memoryGenerators[0].displayName}
                />
                <AvatarFallback>
                  {memoryGenerators[0].displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {memoryGenerators[0].displayName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {memoryGenerators[0].stats.memoriesCreated} memories created
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Top Memory Collectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={memoryCollectors[0].avatarUrl}
                  alt={memoryCollectors[0].displayName}
                />
                <AvatarFallback>
                  {memoryCollectors[0].displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {memoryCollectors[0].displayName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {memoryCollectors[0].stats.memoriesSaved} memories saved
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Top Quest Champions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={questChampions[0].avatarUrl}
                  alt={questChampions[0].displayName}
                />
                <AvatarFallback>
                  {questChampions[0].displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {questChampions[0].displayName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {questChampions[0].stats.questsCompleted} quests completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generators" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="generators">Memory Generators</TabsTrigger>
          <TabsTrigger value="collectors">Memory Collectors</TabsTrigger>
          <TabsTrigger value="quests">Quest Champions</TabsTrigger>
        </TabsList>

        <TabsContent value="generators">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-center">Memories Created</th>
                  <th className="p-4 text-center">Total Engagement</th>
                  <th className="p-4 text-left">Badges</th>
                  <th className="p-4 text-center">Change</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {memoryGenerators.map((user) => (
                  <UserRow key={user.id} user={user} type="generator" />
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="collectors">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-center">Memories Saved</th>
                  <th className="p-4 text-center">Categories Explored</th>
                  <th className="p-4 text-left">Badges</th>
                  <th className="p-4 text-center">Change</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {memoryCollectors.map((user) => (
                  <UserRow key={user.id} user={user} type="collector" />
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="quests">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-center">Quests Completed</th>
                  <th className="p-4 text-center">Badges Earned</th>
                  <th className="p-4 text-center">Total Rewards</th>
                  <th className="p-4 text-left">Badges</th>
                  <th className="p-4 text-center">Change</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {questChampions.map((user) => (
                  <UserRow key={user.id} user={user} type="quest" />
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

