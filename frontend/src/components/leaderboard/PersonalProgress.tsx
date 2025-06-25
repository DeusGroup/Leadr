'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, Target, Trophy, Zap } from 'lucide-react'

interface PersonalProgressProps {
  currentRank: number
  previousRank: number
  points: number
  previousPoints: number
  goalProgress: number
  achievements: number
  streak: number
  timeRange: string
}

export function PersonalProgress({
  currentRank,
  previousRank,
  points,
  previousPoints,
  goalProgress,
  achievements,
  streak,
  timeRange
}: PersonalProgressProps) {
  const [animatedPoints, setAnimatedPoints] = useState(previousPoints)
  const [animatedRank, setAnimatedRank] = useState(previousRank)

  const rankChange = previousRank - currentRank // Positive = moved up
  const pointsChange = points - previousPoints
  const pointsChangePercent = previousPoints > 0 ? ((pointsChange / previousPoints) * 100) : 0

  // Animate counters
  useEffect(() => {
    const pointsTimer = setTimeout(() => {
      setAnimatedPoints(points)
    }, 300)
    
    const rankTimer = setTimeout(() => {
      setAnimatedRank(currentRank)
    }, 600)

    return () => {
      clearTimeout(pointsTimer)
      clearTimeout(rankTimer)
    }
  }, [points, currentRank])

  const getRankTrendIcon = () => {
    if (rankChange > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (rankChange < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getPointsTrendIcon = () => {
    if (pointsChange > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (pointsChange < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  return (
    <Card className="glass-card interactive-hover">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Your Progress ({timeRange})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rank Progress */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Rank</p>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-2xl font-bold">#{animatedRank}</span>
              {getRankTrendIcon()}
              {rankChange !== 0 && (
                <span className={`text-sm ${rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {rankChange > 0 ? '+' : ''}{rankChange}
                </span>
              )}
            </motion.div>
          </div>
          
          <motion.div
            className={`p-2 rounded-full ${
              currentRank <= 3 ? 'bg-yellow-100 text-yellow-700' : 
              currentRank <= 10 ? 'bg-blue-100 text-blue-700' : 
              'bg-gray-100 text-gray-700'
            }`}
            animate={{ 
              scale: currentRank <= 3 ? [1, 1.1, 1] : 1,
              rotate: currentRank <= 3 ? [0, 5, -5, 0] : 0
            }}
            transition={{ 
              duration: 2, 
              repeat: currentRank <= 3 ? Infinity : 0,
              repeatDelay: 3 
            }}
          >
            <Trophy className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Points Progress */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Points Earned</p>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span 
              className="text-2xl font-bold"
              key={animatedPoints}
              animate={{ y: [5, 0], opacity: [0, 1] }}
            >
              {animatedPoints.toLocaleString()}
            </motion.span>
            {getPointsTrendIcon()}
            {pointsChange !== 0 && (
              <span className={`text-sm ${pointsChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pointsChange > 0 ? '+' : ''}{pointsChange} ({pointsChangePercent.toFixed(1)}%)
              </span>
            )}
          </motion.div>
        </div>

        {/* Goal Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Goal Progress</p>
            <span className="text-sm font-medium">{goalProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(goalProgress, 100)}%` }}
              transition={{ duration: 1, delay: 0.9 }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between pt-2 border-t">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Achievements</span>
            </div>
            <p className="text-lg font-semibold">{achievements}</p>
          </motion.div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <p className="text-lg font-semibold">{streak} days</p>
          </motion.div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Target</span>
            </div>
            <p className="text-lg font-semibold">{goalProgress}%</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}