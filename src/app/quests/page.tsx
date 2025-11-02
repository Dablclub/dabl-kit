import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  FilterIcon,
  SearchIcon,
  TagIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Mock data based on the Quest model
const mockQuests = [
  {
    id: '1',
    title: 'Build a Smart Contract for Token Distribution',
    description:
      'Create a Solidity smart contract that can distribute tokens to community members based on their contributions.',
    start: new Date('2023-10-01'),
    end: new Date('2023-12-31'),
    badge: {
      id: 'badge1',
      name: 'Solidity Expert',
      description: 'Awarded to developers who master Solidity development',
      contractAddress: '0x123...',
      chainId: 1,
    },
    project: {
      id: 'project1',
      name: 'DeFi Protocol',
      avatarUrl: '/images/projects/defi-protocol.png',
    },
    rewards: [
      {
        id: 'reward1',
        name: 'DEFI Tokens',
        description: '500 DEFI tokens for completing the quest',
        category: '$DEFI',
        amount: 500,
      },
      {
        id: 'reward2',
        name: 'NFT Badge',
        description: 'Exclusive NFT badge for Solidity experts',
        category: 'NFT',
        amount: 1,
      },
    ],
    difficulty: 'Hard',
    tags: ['smart-contract', 'solidity', 'defi'],
    completions: 3,
    participants: 12,
  },
  {
    id: '2',
    title: 'Design a Community Dashboard UI',
    description:
      'Create a responsive dashboard UI for community members to track their contributions and rewards.',
    start: new Date('2023-11-15'),
    end: new Date('2024-01-15'),
    badge: {
      id: 'badge2',
      name: 'UI Wizard',
      description:
        'Awarded to designers who create exceptional user interfaces',
      contractAddress: '0x456...',
      chainId: 1,
    },
    project: {
      id: 'project2',
      name: 'Community DAO',
      avatarUrl: '/images/projects/community-dao.png',
    },
    rewards: [
      {
        id: 'reward3',
        name: 'DAO Tokens',
        description: '300 DAO tokens for completing the quest',
        category: '$DAO',
        amount: 300,
      },
    ],
    difficulty: 'Medium',
    tags: ['design', 'ui', 'frontend'],
    completions: 7,
    participants: 25,
  },
  {
    id: '3',
    title: 'Develop an API Integration for NFT Metadata',
    description:
      'Build an API integration that fetches and displays NFT metadata from multiple chains.',
    start: new Date('2023-12-01'),
    end: new Date('2024-02-28'),
    badge: {
      id: 'badge3',
      name: 'API Wrangler',
      description: 'Awarded to developers who master API integrations',
      contractAddress: '0x789...',
      chainId: 1,
    },
    project: {
      id: 'project3',
      name: 'NFT Marketplace',
      avatarUrl: '/images/projects/nft-marketplace.png',
    },
    rewards: [
      {
        id: 'reward4',
        name: 'NFT Tokens',
        description: '750 NFT tokens for completing the quest',
        category: '$NFT',
        amount: 750,
      },
      {
        id: 'reward5',
        name: 'Premium Access',
        description: '1 year premium access to the NFT marketplace',
        category: 'Access',
        amount: 1,
      },
    ],
    difficulty: 'Medium',
    tags: ['api', 'nft', 'backend'],
    completions: 2,
    participants: 18,
  },
  {
    id: '4',
    title: 'Create Documentation for Protocol V2',
    description:
      'Write comprehensive documentation for the upcoming V2 release of our protocol.',
    start: new Date('2023-11-01'),
    end: new Date('2024-01-31'),
    badge: {
      id: 'badge4',
      name: 'Documentation Guru',
      description: 'Awarded to contributors who excel at technical writing',
      contractAddress: '0xabc...',
      chainId: 1,
    },
    project: {
      id: 'project4',
      name: 'Protocol Labs',
      avatarUrl: '/images/projects/protocol-labs.png',
    },
    rewards: [
      {
        id: 'reward6',
        name: 'PROTO Tokens',
        description: '400 PROTO tokens for completing the quest',
        category: '$PROTO',
        amount: 400,
      },
    ],
    difficulty: 'Easy',
    tags: ['documentation', 'writing', 'technical'],
    completions: 5,
    participants: 10,
  },
  {
    id: '5',
    title: 'Implement Multi-Chain Support',
    description:
      'Extend our existing protocol to support multiple blockchain networks.',
    start: new Date('2023-12-15'),
    end: new Date('2024-03-15'),
    badge: {
      id: 'badge5',
      name: 'Chain Hopper',
      description: 'Awarded to developers who implement multi-chain solutions',
      contractAddress: '0xdef...',
      chainId: 1,
    },
    project: {
      id: 'project5',
      name: 'Bridge Protocol',
      avatarUrl: '/images/projects/bridge-protocol.png',
    },
    rewards: [
      {
        id: 'reward7',
        name: 'BRIDGE Tokens',
        description: '1000 BRIDGE tokens for completing the quest',
        category: '$BRIDGE',
        amount: 1000,
      },
      {
        id: 'reward8',
        name: 'Developer Grant',
        description: 'Eligibility for a $5000 developer grant',
        category: 'Grant',
        amount: 5000,
      },
    ],
    difficulty: 'Hard',
    tags: ['multi-chain', 'blockchain', 'protocol'],
    completions: 1,
    participants: 30,
  },
]

// Badge component (since it might be missing)
function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode
  variant?: string
  className?: string
}) {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    outline: 'bg-background border border-input text-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant as keyof typeof variantClasses]} ${className}`}
    >
      {children}
    </span>
  )
}

function QuestCard({ quest }: { quest: (typeof mockQuests)[0] }) {
  const daysLeft = Math.ceil(
    (quest.end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )
  const totalReward = quest.rewards.reduce(
    (sum, reward) => sum + reward.amount,
    0,
  )

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {quest.project.avatarUrl && (
              <div className="relative h-6 w-6 overflow-hidden rounded-full">
                <Image
                  src={quest.project.avatarUrl}
                  alt={quest.project.name}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-sm font-medium text-muted-foreground">
              {quest.project.name}
            </span>
          </div>
          <Badge
            variant={
              quest.difficulty === 'Easy'
                ? 'outline'
                : quest.difficulty === 'Medium'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {quest.difficulty}
          </Badge>
        </div>
        <CardTitle className="mt-2 line-clamp-2 text-xl">
          <Link
            href={`/quests/${quest.id}`}
            className="hover:text-primary hover:underline"
          >
            {quest.title}
          </Link>
        </CardTitle>
        <CardDescription className="mt-1 line-clamp-2">
          {quest.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-3 flex flex-wrap gap-1">
          {quest.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <ClockIcon size={14} />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2Icon size={14} />
            <span>
              {quest.completions}/{quest.participants} completed
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon size={16} className="text-primary" />
            <span className="font-semibold text-primary">
              {quest.rewards[0].category === 'Grant' ||
              quest.rewards[0].category === 'Access'
                ? quest.rewards[0].description
                : `${totalReward} ${quest.rewards[0].category}`}
            </span>
          </div>
          <Button size="sm" variant="outline">
            View Quest
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function QuestsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Bounty Board</h1>
        <p className="text-xl text-muted-foreground">
          Complete quests, earn rewards, and build your reputation
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search quests..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FilterIcon size={16} />
            <span>Filter</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <CalendarIcon size={16} />
            <span>Date</span>
          </Button>
          <Button size="sm">+ Create Quest</Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="mb-8">
        <TabsList>
          <TabsTrigger value="active">Active Quests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="my-quests">My Quests</TabsTrigger>
          <TabsTrigger value="all">All Quests</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <CheckCircle2Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-xl font-medium">
              No completed quests yet
            </h3>
            <p className="text-muted-foreground">
              Start completing quests to see them here
            </p>
          </div>
        </TabsContent>
        <TabsContent value="my-quests" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <TagIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-xl font-medium">
              You haven&apos;t joined any quests
            </h3>
            <p className="text-muted-foreground">
              Join quests to track your progress here
            </p>
            <Button className="mt-4">Browse Quests</Button>
          </div>
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

