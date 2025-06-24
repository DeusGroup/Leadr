export * from '@/shared/types'

// Additional frontend-specific types
export interface LeaderboardEntry {
  id: number
  name: string
  email: string
  department: string
  points?: number
  achievements?: number
  rank: number
  pointsChange?: number
  avatar?: string
  territory?: string
  boardRevenue?: number
  mspRevenue?: number
  voiceSeats?: number
  totalDeals?: number
  weightedScore?: number
  revenueChange?: number
}

export interface DashboardMetrics {
  totalRevenue: string
  employeePoints: string
  activeUsers: string
  goalsAchieved: string
}

export interface ActivityFeedItem {
  id: number
  type: 'achievement' | 'sales' | 'goal'
  user: string
  action: string
  value?: string
  timestamp: Date
  avatar?: string
}

export interface LeaderboardFilters {
  department?: string
  territory?: string
  userType?: string
  dateRange?: {
    start: Date
    end: Date
  }
}
