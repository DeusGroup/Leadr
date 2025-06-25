'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Crown, TrendingUp, TrendingDown, Minus, Trophy, Star, Zap } from 'lucide-react'
import { FilterState } from './LeaderboardFilters'

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

interface EnhancedLeaderboardTableProps {
  entries: LeaderboardEntry[]
  filters: FilterState
  isLoading?: boolean
  title?: string
}

export function EnhancedLeaderboardTable({
  entries,
  filters,
  isLoading = false,
  title = "Leaderboard"
}: EnhancedLeaderboardTableProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-badge-1'
    if (rank === 2) return 'rank-badge-2'
    if (rank === 3) return 'rank-badge-3'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (filters.metric) {
      case 'points':
        return entry.points.toLocaleString()
      case 'achievements':
        return entry.achievements.toString()
      case 'activity':
        return `${entry.streak} days`
      case 'growth':
        return `${entry.growth || 0}%`
      default:
        return entry.points.toLocaleString()
    }
  }

  const getMetricIcon = () => {
    switch (filters.metric) {
      case 'points':
        return <Star className="w-4 h-4" />
      case 'achievements':
        return <Trophy className="w-4 h-4" />
      case 'activity':
        return <Zap className="w-4 h-4" />
      case 'growth':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="loading-skeleton w-6 h-6 rounded"></div>
            <div className="loading-skeleton h-6 w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="loading-skeleton w-10 h-10 rounded-full"></div>
                <div className="loading-skeleton w-12 h-8 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="loading-skeleton h-4 w-40"></div>
                  <div className="loading-skeleton h-3 w-24"></div>
                </div>
                <div className="loading-skeleton h-6 w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getMetricIcon()}
          {title} - {filters.metric.charAt(0).toUpperCase() + filters.metric.slice(1)}
          <Badge variant="secondary" className="ml-auto">
            {filters.timeRange.charAt(0).toUpperCase() + filters.timeRange.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.id}-${filters.timeRange}-${filters.metric}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all duration-200
                  ${entry.isCurrentUser 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                  interactive-hover
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Rank Badge */}
                <motion.div
                  className={`
                    relative flex items-center justify-center w-12 h-10 rounded-full text-sm font-bold
                    ${getRankBadgeClass(entry.rank)}
                    ${entry.rank <= 3 ? 'pulse-glow' : ''}
                  `}
                  whileHover={{ scale: 1.1, rotate: entry.rank <= 3 ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {entry.rank <= 3 && (
                    <Crown className="w-4 h-4 absolute" />
                  )}
                  <span className={entry.rank <= 3 ? 'opacity-0' : ''}>
                    {entry.rank}
                  </span>
                </motion.div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.avatar} alt={entry.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                        {getInitials(entry.name)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold truncate ${entry.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                        {entry.name}
                      </h3>
                      {entry.isCurrentUser && (
                        <Badge variant="default" className="text-xs">You</Badge>
                      )}
                      {entry.rank <= 3 && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.department}</p>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="w-3 h-3" />
                        <span>{entry.achievements}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        <span>{entry.streak}d</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points & Change */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <motion.span 
                      className="text-lg font-bold"
                      key={entry.points}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {getMetricValue(entry)}
                    </motion.span>
                    {getTrendIcon(entry.change)}
                  </div>
                  {entry.change !== 0 && (
                    <motion.p 
                      className={`text-sm ${entry.change > 0 ? 'text-green-500' : 'text-red-500'}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {entry.change > 0 ? '+' : ''}{entry.change}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {entries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No entries found</p>
              <p className="text-sm">Try adjusting your filters to see more results</p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}