'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Crown, User } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  rank: number
  points: number
  change: number
  department: string
  isCurrentUser?: boolean
}

interface NearMeViewProps {
  currentUserRank: number
  entries: LeaderboardEntry[]
  isLoading?: boolean
}

export function NearMeView({ currentUserRank, entries, isLoading = false }: NearMeViewProps) {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="loading-skeleton w-8 h-8 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="loading-skeleton h-4 w-32"></div>
                  <div className="loading-skeleton h-3 w-20"></div>
                </div>
                <div className="loading-skeleton h-6 w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-500" />
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-badge-1'
    if (rank === 2) return 'rank-badge-2'
    if (rank === 3) return 'rank-badge-3'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-sm text-muted-foreground">
              Rankings Around You (±5 positions)
            </h3>
          </div>

          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                ${entry.isCurrentUser 
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 scale-in' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }
              `}
              whileHover={{ scale: entry.isCurrentUser ? 1 : 1.02 }}
            >
              {/* Rank Badge */}
              <motion.div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                  ${getRankBadgeClass(entry.rank)}
                  ${entry.rank <= 3 ? 'pulse-glow' : ''}
                `}
                whileHover={{ scale: 1.1 }}
              >
                {entry.rank <= 3 && (
                  <Crown className="w-3 h-3 absolute" />
                )}
                <span className={entry.rank <= 3 ? 'opacity-0' : ''}>
                  {entry.rank}
                </span>
              </motion.div>

              {/* Avatar & Info */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {getInitials(entry.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium truncate ${entry.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                      {entry.name}
                      {entry.isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.department}</p>
                </div>
              </div>

              {/* Points & Change */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{entry.points.toLocaleString()}</span>
                  {getTrendIcon(entry.change)}
                </div>
                {entry.change !== 0 && (
                  <p className={`text-xs ${entry.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {entry.change > 0 ? '+' : ''}{entry.change}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No rankings available in your range</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}