export interface User {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  bio: string
  createdAt: Date
  role: string
  stats: {
    memoriesCreated: number
    memoriesSaved: number
    questsCompleted: number
    badgesEarned: number
    totalRewards: number
    totalEngagement: number
    categoriesExplored: number
    rank: number
    previousRank: number
  }
}

export interface Memory {
  id: string
  title: string
  source: string
  language: string
  createdAt: Date
  userId: string
  visibility: string
  engagement: number
  categories: string[]
}

export interface Badge {
  id: string
  name: string
  description: string
  tier: string
  imageUrl: string
}

export interface Quest {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  difficulty: string
  projectId: string
  completions: number
  participants: number
}

export interface Reward {
  id: string
  name: string
  description: string
  category: string
  amount: number
  questId: string
}
