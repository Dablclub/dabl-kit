import { User, Memory, Quest, Badge, Reward } from '@/types/models'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'alex_blockchain',
    displayName: 'Alex Johnson',
    avatarUrl: '/images/avatars/alex.jpg',
    bio: 'Blockchain developer and memory enthusiast. Building the future of decentralized knowledge.',
    createdAt: new Date('2022-03-15'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 87,
      memoriesSaved: 42,
      questsCompleted: 15,
      badgesEarned: 8,
      totalRewards: 2450,
      totalEngagement: 342,
      categoriesExplored: 12,
      rank: 1,
      previousRank: 1,
    },
  },
  {
    id: 'user2',
    username: 'sara_web3',
    displayName: 'Sara Williams',
    avatarUrl: '/images/avatars/sara.jpg',
    bio: 'Web3 researcher and community builder. Passionate about collective intelligence.',
    createdAt: new Date('2022-04-10'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 76,
      memoriesSaved: 38,
      questsCompleted: 12,
      badgesEarned: 7,
      totalRewards: 1950,
      totalEngagement: 289,
      categoriesExplored: 10,
      rank: 2,
      previousRank: 3,
    },
  },
  {
    id: 'user3',
    username: 'crypto_mike',
    displayName: 'Mike Chen',
    avatarUrl: '/images/avatars/mike.jpg',
    bio: 'Crypto analyst and technical writer. Documenting the journey through Web3.',
    createdAt: new Date('2022-02-28'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 65,
      memoriesSaved: 29,
      questsCompleted: 10,
      badgesEarned: 6,
      totalRewards: 1650,
      totalEngagement: 253,
      categoriesExplored: 8,
      rank: 3,
      previousRank: 2,
    },
  },
  {
    id: 'user4',
    username: 'defi_queen',
    displayName: 'Jessica Taylor',
    avatarUrl: '/images/avatars/jessica.jpg',
    bio: 'DeFi specialist and educator. Helping others navigate the world of decentralized finance.',
    createdAt: new Date('2022-05-20'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 58,
      memoriesSaved: 45,
      questsCompleted: 14,
      badgesEarned: 5,
      totalRewards: 1850,
      totalEngagement: 217,
      categoriesExplored: 7,
      rank: 4,
      previousRank: 6,
    },
  },
  {
    id: 'user5',
    username: 'nft_dave',
    displayName: 'Dave Rodriguez',
    avatarUrl: '/images/avatars/dave.jpg',
    bio: 'NFT artist and collector. Creating and curating digital memories.',
    createdAt: new Date('2022-04-05'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 52,
      memoriesSaved: 67,
      questsCompleted: 9,
      badgesEarned: 4,
      totalRewards: 1250,
      totalEngagement: 198,
      categoriesExplored: 6,
      rank: 5,
      previousRank: 5,
    },
  },
  {
    id: 'user6',
    username: 'collector_emma',
    displayName: 'Emma Wilson',
    avatarUrl: '/images/avatars/emma.jpg',
    bio: "Knowledge curator and information architect. Organizing the world's memories.",
    createdAt: new Date('2022-06-12'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 43,
      memoriesSaved: 124,
      questsCompleted: 11,
      badgesEarned: 6,
      totalRewards: 1550,
      totalEngagement: 176,
      categoriesExplored: 15,
      rank: 6,
      previousRank: 7,
    },
  },
  {
    id: 'user7',
    username: 'tech_james',
    displayName: 'James Cooper',
    avatarUrl: '/images/avatars/james.jpg',
    bio: 'Tech enthusiast and early adopter. Always exploring new technologies and ideas.',
    createdAt: new Date('2022-03-25'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 39,
      memoriesSaved: 112,
      questsCompleted: 13,
      badgesEarned: 7,
      totalRewards: 1750,
      totalEngagement: 165,
      categoriesExplored: 12,
      rank: 7,
      previousRank: 8,
    },
  },
  {
    id: 'user8',
    username: 'crypto_olivia',
    displayName: 'Olivia Martinez',
    avatarUrl: '/images/avatars/olivia.jpg',
    bio: 'Cryptocurrency researcher and community moderator. Building bridges in the digital world.',
    createdAt: new Date('2022-05-05'),
    role: 'MODERATOR',
    stats: {
      memoriesCreated: 47,
      memoriesSaved: 98,
      questsCompleted: 16,
      badgesEarned: 9,
      totalRewards: 2150,
      totalEngagement: 187,
      categoriesExplored: 10,
      rank: 8,
      previousRank: 4,
    },
  },
  {
    id: 'user9',
    username: 'blockchain_noah',
    displayName: 'Noah Garcia',
    avatarUrl: '/images/avatars/noah.jpg',
    bio: 'Blockchain developer and protocol designer. Creating the infrastructure for tomorrow.',
    createdAt: new Date('2022-04-18'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 35,
      memoriesSaved: 87,
      questsCompleted: 8,
      badgesEarned: 5,
      totalRewards: 1150,
      totalEngagement: 142,
      categoriesExplored: 9,
      rank: 9,
      previousRank: 11,
    },
  },
  {
    id: 'user10',
    username: 'web3_sophia',
    displayName: 'Sophia Lee',
    avatarUrl: '/images/avatars/sophia.jpg',
    bio: 'Web3 developer and community advocate. Building a more decentralized internet.',
    createdAt: new Date('2022-06-02'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 31,
      memoriesSaved: 76,
      questsCompleted: 7,
      badgesEarned: 4,
      totalRewards: 950,
      totalEngagement: 128,
      categoriesExplored: 8,
      rank: 10,
      previousRank: 13,
    },
  },
  {
    id: 'user11',
    username: 'quest_hunter',
    displayName: 'Ethan Wright',
    avatarUrl: '/images/avatars/ethan.jpg',
    bio: 'Quest enthusiast and achievement hunter. Always looking for the next challenge.',
    createdAt: new Date('2022-03-10'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 29,
      memoriesSaved: 65,
      questsCompleted: 28,
      badgesEarned: 12,
      totalRewards: 4500,
      totalEngagement: 156,
      categoriesExplored: 11,
      rank: 11,
      previousRank: 10,
    },
  },
  {
    id: 'user12',
    username: 'badge_collector',
    displayName: 'Ava Johnson',
    avatarUrl: '/images/avatars/ava.jpg',
    bio: 'Badge collector and community contributor. Showcasing achievements in the digital realm.',
    createdAt: new Date('2022-05-15'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 27,
      memoriesSaved: 58,
      questsCompleted: 25,
      badgesEarned: 15,
      totalRewards: 3800,
      totalEngagement: 143,
      categoriesExplored: 9,
      rank: 12,
      previousRank: 9,
    },
  },
  {
    id: 'user13',
    username: 'reward_hunter',
    displayName: 'Liam Thompson',
    avatarUrl: '/images/avatars/liam.jpg',
    bio: 'Reward hunter and community builder. Helping others achieve their goals.',
    createdAt: new Date('2022-04-22'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 25,
      memoriesSaved: 52,
      questsCompleted: 22,
      badgesEarned: 10,
      totalRewards: 4200,
      totalEngagement: 132,
      categoriesExplored: 8,
      rank: 13,
      previousRank: 14,
    },
  },
  {
    id: 'user14',
    username: 'challenge_master',
    displayName: 'Isabella Rodriguez',
    avatarUrl: '/images/avatars/isabella.jpg',
    bio: 'Challenge master and problem solver. Finding solutions in the digital landscape.',
    createdAt: new Date('2022-06-08'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 23,
      memoriesSaved: 49,
      questsCompleted: 20,
      badgesEarned: 9,
      totalRewards: 3500,
      totalEngagement: 118,
      categoriesExplored: 7,
      rank: 14,
      previousRank: 12,
    },
  },
  {
    id: 'user15',
    username: 'achievement_king',
    displayName: 'Lucas Kim',
    avatarUrl: '/images/avatars/lucas.jpg',
    bio: 'Achievement hunter and community mentor. Guiding others on their journey.',
    createdAt: new Date('2022-05-25'),
    role: 'MEMBER',
    stats: {
      memoriesCreated: 21,
      memoriesSaved: 45,
      questsCompleted: 18,
      badgesEarned: 8,
      totalRewards: 3200,
      totalEngagement: 105,
      categoriesExplored: 6,
      rank: 15,
      previousRank: 17,
    },
  },
]

// Mock Memories
export const mockMemories: Memory[] = [
  {
    id: 'memory1',
    title: 'Ethereum Layer 2 Solutions Explained',
    source: 'conversation',
    language: 'en',
    createdAt: new Date('2023-06-15'),
    userId: 'user1',
    visibility: 'public',
    engagement: 87,
    categories: ['blockchain', 'ethereum', 'scaling'],
  },
  {
    id: 'memory2',
    title: 'Web3 Social Platforms Comparison',
    source: 'conversation',
    language: 'en',
    createdAt: new Date('2023-06-18'),
    userId: 'user2',
    visibility: 'public',
    engagement: 76,
    categories: ['web3', 'social', 'platforms'],
  },
  {
    id: 'memory3',
    title: 'NFT Market Analysis Q2 2023',
    source: 'conversation',
    language: 'en',
    createdAt: new Date('2023-06-20'),
    userId: 'user3',
    visibility: 'public',
    engagement: 65,
    categories: ['nft', 'market', 'analysis'],
  },
  {
    id: 'memory4',
    title: 'DeFi Yield Strategies for Beginners',
    source: 'conversation',
    language: 'en',
    createdAt: new Date('2023-06-22'),
    userId: 'user4',
    visibility: 'public',
    engagement: 58,
    categories: ['defi', 'yield', 'strategies'],
  },
  {
    id: 'memory5',
    title: 'Digital Art Creation Workflow',
    source: 'conversation',
    language: 'en',
    createdAt: new Date('2023-06-25'),
    userId: 'user5',
    visibility: 'public',
    engagement: 52,
    categories: ['art', 'digital', 'creation'],
  },
]

// Mock Badges
export const mockBadges: Badge[] = [
  {
    id: 'badge1',
    name: 'Memory Master',
    description: 'Created 50+ high-quality memories',
    tier: 'gold',
    imageUrl: '/images/badges/memory-master.png',
  },
  {
    id: 'badge2',
    name: 'Early Adopter',
    description: "Joined during the platform's first month",
    tier: 'silver',
    imageUrl: '/images/badges/early-adopter.png',
  },
  {
    id: 'badge3',
    name: 'Content Creator',
    description: 'Consistently creates valuable content',
    tier: 'gold',
    imageUrl: '/images/badges/content-creator.png',
  },
  {
    id: 'badge4',
    name: 'Community Guide',
    description: 'Helps others navigate the platform',
    tier: 'silver',
    imageUrl: '/images/badges/community-guide.png',
  },
  {
    id: 'badge5',
    name: 'Consistent Creator',
    description: 'Created content every week for a month',
    tier: 'bronze',
    imageUrl: '/images/badges/consistent-creator.png',
  },
  {
    id: 'badge6',
    name: 'Rising Star',
    description: 'Rapidly growing engagement on content',
    tier: 'bronze',
    imageUrl: '/images/badges/rising-star.png',
  },
  {
    id: 'badge7',
    name: 'Trendsetter',
    description: 'Creates content that starts discussions',
    tier: 'silver',
    imageUrl: '/images/badges/trendsetter.png',
  },
  {
    id: 'badge8',
    name: 'Memory Curator',
    description: 'Saved and organized 100+ memories',
    tier: 'gold',
    imageUrl: '/images/badges/memory-curator.png',
  },
  {
    id: 'badge9',
    name: 'Knowledge Seeker',
    description: 'Explored 10+ different categories',
    tier: 'silver',
    imageUrl: '/images/badges/knowledge-seeker.png',
  },
  {
    id: 'badge10',
    name: 'Quest Champion',
    description: 'Completed 25+ quests',
    tier: 'gold',
    imageUrl: '/images/badges/quest-champion.png',
  },
]

// Mock Quests
export const mockQuests: Quest[] = [
  {
    id: 'quest1',
    title: 'Build a Smart Contract for Token Distribution',
    description:
      'Create a Solidity smart contract that can distribute tokens to community members based on their contributions.',
    start: new Date('2023-05-01'),
    end: new Date('2023-07-31'),
    difficulty: 'Hard',
    projectId: 'project1',
    completions: 3,
    participants: 12,
  },
  {
    id: 'quest2',
    title: 'Design a Community Dashboard UI',
    description:
      'Create a responsive dashboard UI for community members to track their contributions and rewards.',
    start: new Date('2023-06-15'),
    end: new Date('2023-08-15'),
    difficulty: 'Medium',
    projectId: 'project2',
    completions: 7,
    participants: 25,
  },
  {
    id: 'quest3',
    title: 'Develop an API Integration for NFT Metadata',
    description:
      'Build an API integration that fetches and displays NFT metadata from multiple chains.',
    start: new Date('2023-06-01'),
    end: new Date('2023-08-31'),
    difficulty: 'Medium',
    projectId: 'project3',
    completions: 2,
    participants: 18,
  },
]

// Mock Rewards
export const mockRewards: Reward[] = [
  {
    id: 'reward1',
    name: 'DEFI Tokens',
    description: '500 DEFI tokens for completing the quest',
    category: '$DEFI',
    amount: 500,
    questId: 'quest1',
  },
  {
    id: 'reward2',
    name: 'NFT Badge',
    description: 'Exclusive NFT badge for Solidity experts',
    category: 'NFT',
    amount: 1,
    questId: 'quest1',
  },
  {
    id: 'reward3',
    name: 'DAO Tokens',
    description: '300 DAO tokens for completing the quest',
    category: '$DAO',
    amount: 300,
    questId: 'quest2',
  },
]

// User-Badge Relationships
export const userBadges = [
  { userId: 'user1', badgeIds: ['badge1', 'badge2'] },
  { userId: 'user2', badgeIds: ['badge3', 'badge4'] },
  { userId: 'user3', badgeIds: ['badge5'] },
  { userId: 'user4', badgeIds: ['badge6'] },
  { userId: 'user5', badgeIds: ['badge7'] },
  { userId: 'user6', badgeIds: ['badge8', 'badge9'] },
  { userId: 'user7', badgeIds: ['badge5'] },
  { userId: 'user8', badgeIds: ['badge4', 'badge7'] },
  { userId: 'user9', badgeIds: ['badge6'] },
  { userId: 'user10', badgeIds: ['badge5'] },
  { userId: 'user11', badgeIds: ['badge10'] },
  { userId: 'user12', badgeIds: ['badge10', 'badge9'] },
  { userId: 'user13', badgeIds: ['badge10'] },
  { userId: 'user14', badgeIds: ['badge10'] },
  { userId: 'user15', badgeIds: ['badge10'] },
]

// User-Quest Completions
export const userQuestCompletions = [
  { userId: 'user1', questIds: ['quest1', 'quest2'] },
  { userId: 'user2', questIds: ['quest2'] },
  { userId: 'user3', questIds: ['quest3'] },
  { userId: 'user4', questIds: ['quest1', 'quest3'] },
  { userId: 'user5', questIds: ['quest2'] },
  { userId: 'user6', questIds: ['quest2', 'quest3'] },
  { userId: 'user7', questIds: ['quest1'] },
  { userId: 'user8', questIds: ['quest1', 'quest2', 'quest3'] },
  { userId: 'user9', questIds: ['quest2'] },
  { userId: 'user10', questIds: ['quest3'] },
  { userId: 'user11', questIds: ['quest1', 'quest2', 'quest3'] },
  { userId: 'user12', questIds: ['quest1', 'quest2', 'quest3'] },
  { userId: 'user13', questIds: ['quest1', 'quest2'] },
  { userId: 'user14', questIds: ['quest2', 'quest3'] },
  { userId: 'user15', questIds: ['quest1', 'quest3'] },
]

// User-Memory Saved (Collections)
export const userMemorySaves = [
  { userId: 'user1', memoryIds: ['memory2', 'memory3', 'memory4', 'memory5'] },
  { userId: 'user2', memoryIds: ['memory1', 'memory3', 'memory5'] },
  { userId: 'user3', memoryIds: ['memory1', 'memory2', 'memory4'] },
  { userId: 'user4', memoryIds: ['memory1', 'memory2', 'memory3', 'memory5'] },
  { userId: 'user5', memoryIds: ['memory1', 'memory2', 'memory3', 'memory4'] },
  {
    userId: 'user6',
    memoryIds: ['memory1', 'memory2', 'memory3', 'memory4', 'memory5'],
  },
  {
    userId: 'user7',
    memoryIds: ['memory1', 'memory2', 'memory3', 'memory4', 'memory5'],
  },
  {
    userId: 'user8',
    memoryIds: ['memory1', 'memory2', 'memory3', 'memory4', 'memory5'],
  },
  { userId: 'user9', memoryIds: ['memory1', 'memory2', 'memory3', 'memory4'] },
  { userId: 'user10', memoryIds: ['memory1', 'memory2', 'memory5'] },
]

// Helper functions to get data for the leaderboard
export function getTopMemoryGenerators(limit = 5) {
  return mockUsers
    .sort((a, b) => b.stats.memoriesCreated - a.stats.memoriesCreated)
    .slice(0, limit)
    .map((user) => ({
      ...user,
      change: user.stats.previousRank - user.stats.rank,
      badges: getUserBadges(user.id).map((badge) => badge.name),
    }))
}

export function getTopMemoryCollectors(limit = 5) {
  return mockUsers
    .sort((a, b) => b.stats.memoriesSaved - a.stats.memoriesSaved)
    .slice(0, limit)
    .map((user) => ({
      ...user,
      change: user.stats.previousRank - user.stats.rank,
      badges: getUserBadges(user.id).map((badge) => badge.name),
    }))
}

export function getTopQuestChampions(limit = 5) {
  return mockUsers
    .sort((a, b) => b.stats.questsCompleted - a.stats.questsCompleted)
    .slice(0, limit)
    .map((user) => ({
      ...user,
      change: user.stats.previousRank - user.stats.rank,
      badges: getUserBadges(user.id).map((badge) => badge.name),
    }))
}

export function getUserBadges(userId: string) {
  const userBadgeRelation = userBadges.find((ub) => ub.userId === userId)
  if (!userBadgeRelation) return []

  return userBadgeRelation.badgeIds
    .map((badgeId) => mockBadges.find((badge) => badge.id === badgeId))
    .filter((badge) => badge !== undefined) as Badge[]
}

export function getUserCompletedQuests(userId: string) {
  const userQuestRelation = userQuestCompletions.find(
    (uq) => uq.userId === userId,
  )
  if (!userQuestRelation) return []

  return userQuestRelation.questIds
    .map((questId) => mockQuests.find((quest) => quest.id === questId))
    .filter((quest) => quest !== undefined) as Quest[]
}

export function getUserSavedMemories(userId: string) {
  const userMemoryRelation = userMemorySaves.find((um) => um.userId === userId)
  if (!userMemoryRelation) return []

  return userMemoryRelation.memoryIds
    .map((memoryId) => mockMemories.find((memory) => memory.id === memoryId))
    .filter((memory) => memory !== undefined) as Memory[]
}

