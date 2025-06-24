// User types
export interface User {
  id: number
  organizationId?: number
  email: string
  firstName: string
  lastName: string
  username?: string
  userType: 'admin' | 'manager' | 'employee' | 'sales_rep'
  status: 'active' | 'inactive' | 'suspended'
  department?: string
  territory?: string
  manager?: string
  avatar?: string
  phoneNumber?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Organization types
export interface Organization {
  id: number
  name: string
  slug: string
  description?: string
  settings?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Leaderboard types
export interface Leaderboard {
  id: number
  organizationId?: number
  name: string
  description?: string
  type: 'employee' | 'sales' | 'mixed'
  isActive: boolean
  startDate?: Date
  endDate?: Date
  settings?: string
  createdAt: Date
  updatedAt: Date
}

// Metric types
export interface Metric {
  id: number
  userId?: number
  leaderboardId?: number
  metricType: 'points' | 'revenue' | 'deals' | 'voice_seats' | 'custom'
  value: string
  description?: string
  source?: string
  weight: string
  recordedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Achievement types
export interface Achievement {
  id: number
  organizationId?: number
  name: string
  description?: string
  type: 'milestone' | 'streak' | 'goal' | 'recognition'
  icon?: string
  pointsValue: number
  criteria?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// User Achievement types
export interface UserAchievement {
  id: number
  userId?: number
  achievementId?: number
  earnedAt: Date
  createdAt: Date
}

// Sales Goal types
export interface SalesGoal {
  id: number
  userId?: number
  leaderboardId?: number
  metricType: 'points' | 'revenue' | 'deals' | 'voice_seats' | 'custom'
  targetValue: string
  currentValue: string
  period: string
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Leaderboard Ranking types
export interface LeaderboardRanking {
  id: number
  leaderboardId?: number
  userId?: number
  rank: number
  score: string
  previousRank?: number
  rankChange?: number
  calculatedAt: Date
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

// Authentication types
export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Activity types
export interface Activity {
  id: number
  userId?: number
  organizationId?: number
  action: string
  description?: string
  metadata?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}
