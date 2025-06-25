'use client'

import { useState, useEffect, useMemo } from 'react'
import { FilterState } from '@/components/leaderboard/LeaderboardFilters'

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  rank: number
  points: number
  change: number
  department: string
  achievements: number
  streak: number
  isCurrentUser?: boolean
  growth?: number
}

interface UseLeaderboardFiltersReturn {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  filteredEntries: LeaderboardEntry[]
  nearMeEntries: LeaderboardEntry[]
  currentUserRank: number | null
  isLoading: boolean
  updateFilter: (key: keyof FilterState, value: any) => void
}

// Mock data - in real app this would come from API
const generateMockData = (): LeaderboardEntry[] => {
  const departments = ['sales', 'engineering', 'marketing', 'support']
  const names = [
    'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez', 'Jessica Kim',
    'David Wilson', 'Lisa Wang', 'John Smith', 'Maria Garcia', 'Kevin O\'Brien',
    'Rachel Green', 'Tom Anderson', 'Sophie Turner', 'Chris Lee', 'Amanda White',
    'Ryan Taylor', 'Nicole Brown', 'Brad Miller', 'Samantha Jones', 'Derek Yang'
  ]

  return names.map((name, index) => ({
    id: `user-${index + 1}`,
    name,
    avatar: undefined,
    rank: index + 1,
    points: Math.max(1000 - (index * 50) + Math.random() * 100, 100),
    change: Math.floor((Math.random() - 0.5) * 100),
    department: departments[index % departments.length],
    achievements: Math.floor(Math.random() * 20) + 1,
    streak: Math.floor(Math.random() * 30) + 1,
    isCurrentUser: index === 7, // John Smith is current user
    growth: Math.floor((Math.random() - 0.3) * 50)
  }))
}

export function useLeaderboardFilters(): UseLeaderboardFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'monthly',
    department: 'all',
    view: 'all',
    metric: 'points'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [rawData, setRawData] = useState<LeaderboardEntry[]>([])

  // Load filter preferences from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('leaderboard-filters')
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters)
        setFilters(prev => ({ ...prev, ...parsed }))
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  // Save filter preferences to localStorage
  useEffect(() => {
    localStorage.setItem('leaderboard-filters', JSON.stringify(filters))
  }, [filters])

  // Simulate data loading
  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const mockData = generateMockData()
      setRawData(mockData)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters.timeRange, filters.metric])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Filter and sort data based on current filters
  const filteredEntries = useMemo(() => {
    let filtered = [...rawData]

    // Filter by department
    if (filters.department !== 'all') {
      filtered = filtered.filter(entry => entry.department === filters.department)
    }

    // Sort by selected metric
    filtered.sort((a, b) => {
      switch (filters.metric) {
        case 'points':
          return b.points - a.points
        case 'achievements':
          return b.achievements - a.achievements
        case 'activity':
          return b.streak - a.streak
        case 'growth':
          return (b.growth || 0) - (a.growth || 0)
        default:
          return b.points - a.points
      }
    })

    // Update ranks based on sort
    filtered = filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    // Apply view filter
    if (filters.view === 'top-10') {
      filtered = filtered.slice(0, 10)
    }

    return filtered
  }, [rawData, filters])

  // Find current user's rank
  const currentUserRank = useMemo(() => {
    const userEntry = filteredEntries.find(entry => entry.isCurrentUser)
    return userEntry?.rank || null
  }, [filteredEntries])

  // Get entries around current user (±5 positions)
  const nearMeEntries = useMemo(() => {
    if (!currentUserRank || filters.view !== 'near-me') {
      return []
    }

    const startIndex = Math.max(0, currentUserRank - 6)
    const endIndex = Math.min(filteredEntries.length, currentUserRank + 5)
    
    return filteredEntries.slice(startIndex, endIndex)
  }, [filteredEntries, currentUserRank, filters.view])

  // Return appropriate entries based on view
  const displayEntries = filters.view === 'near-me' ? nearMeEntries : filteredEntries

  return {
    filters,
    setFilters,
    filteredEntries: displayEntries,
    nearMeEntries,
    currentUserRank,
    isLoading,
    updateFilter
  }
}