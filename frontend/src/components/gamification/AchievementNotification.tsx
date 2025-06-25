'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Star, Zap, Target, Award, Crown, X } from 'lucide-react'
import Confetti from 'react-confetti'

interface Achievement {
  id: string
  title: string
  description: string
  type: 'milestone' | 'streak' | 'performance' | 'collaboration' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  icon?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: Date
}

interface AchievementNotificationProps {
  achievement?: Achievement
  onDismiss?: () => void
  showConfetti?: boolean
  position?: 'top-right' | 'center' | 'bottom-right'
}

export function AchievementNotification({
  achievement,
  onDismiss,
  showConfetti = true,
  position = 'top-right'
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfettiEffect, setShowConfettiEffect] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      
      if (showConfetti && achievement.rarity !== 'common') {
        setShowConfettiEffect(true)
        setTimeout(() => setShowConfettiEffect(false), 4000)
      }

      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        handleDismiss()
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [achievement, showConfetti])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss?.()
    }, 300)
  }

  const getAchievementIcon = (type: Achievement['type']) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-6 h-6" />
      case 'streak': return <Zap className="w-6 h-6" />
      case 'performance': return <Star className="w-6 h-6" />
      case 'collaboration': return <Award className="w-6 h-6" />
      case 'special': return <Crown className="w-6 h-6" />
      default: return <Trophy className="w-6 h-6" />
    }
  }

  const getTierGradient = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-800'
      case 'silver': return 'from-gray-400 to-gray-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'platinum': return 'from-purple-400 to-purple-600'
    }
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'fixed top-4 right-4 z-50'
      case 'center': return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'
      case 'bottom-right': return 'fixed bottom-4 right-4 z-50'
    }
  }

  if (!achievement) return null

  return (
    <>
      {showConfettiEffect && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={achievement.rarity === 'legendary' ? 500 : 200}
          gravity={0.2}
          colors={achievement.tier === 'gold' ? ['#FFD700', '#FFA500', '#FFFF00'] : undefined}
        />
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={getPositionClasses()}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <Card className="w-80 shadow-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <motion.div
                    className={`
                      p-3 rounded-full bg-gradient-to-br ${getTierGradient(achievement.tier)} 
                      text-white shadow-lg
                    `}
                    animate={{ 
                      rotate: [0, -10, 10, -5, 5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.6,
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                    }}
                  >
                    {getAchievementIcon(achievement.type)}
                  </motion.div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${getRarityColor(achievement.rarity)} border text-xs font-bold`}
                      variant="outline"
                    >
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {achievement.tier.toUpperCase()}
                    </Badge>
                  </div>

                  <motion.h3 
                    className="text-lg font-bold text-foreground"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      color: ['#000000', '#FFD700', '#000000']
                    }}
                    transition={{ 
                      duration: 1,
                      times: [0, 0.5, 1]
                    }}
                  >
                    🎉 Achievement Unlocked!
                  </motion.h3>

                  <h4 className="text-md font-semibold text-foreground">
                    {achievement.title}
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <motion.div 
                      className="flex items-center gap-1 text-yellow-600 font-bold"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 0.5,
                        repeat: 3,
                        delay: 0.5
                      }}
                    >
                      <Star className="w-4 h-4" />
                      <span>+{achievement.points} points</span>
                    </motion.div>

                    <span className="text-xs text-muted-foreground">
                      {achievement.unlockedAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Celebration effects */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        left: `${20 + (i * 10)}%`,
                        top: `${10 + (i % 2) * 80}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: 2,
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for managing achievements
export function useAchievements() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  const mockAchievements: Achievement[] = [
    {
      id: 'first-sale',
      title: 'First Blood',
      description: 'Made your first sale of the month!',
      type: 'milestone',
      tier: 'bronze',
      points: 100,
      rarity: 'common',
      unlockedAt: new Date()
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Maintained activity for 7 consecutive days',
      type: 'streak',
      tier: 'silver',
      points: 200,
      rarity: 'rare',
      unlockedAt: new Date()
    },
    {
      id: 'top-performer',
      title: 'Rising Star',
      description: 'Reached top 10 in your department!',
      type: 'performance',
      tier: 'gold',
      points: 500,
      rarity: 'epic',
      unlockedAt: new Date()
    },
    {
      id: 'legendary-month',
      title: 'Legend of the Month',
      description: 'Dominated every metric this month!',
      type: 'special',
      tier: 'platinum',
      points: 1000,
      rarity: 'legendary',
      unlockedAt: new Date()
    }
  ]

  const triggerRandomAchievement = () => {
    const randomAchievement = mockAchievements[Math.floor(Math.random() * mockAchievements.length)]
    setCurrentAchievement({
      ...randomAchievement,
      id: `${randomAchievement.id}-${Date.now()}`,
      unlockedAt: new Date()
    })
  }

  const dismissAchievement = () => {
    if (currentAchievement) {
      setAchievements(prev => [...prev, currentAchievement])
      setCurrentAchievement(null)
    }
  }

  return {
    currentAchievement,
    achievements,
    triggerRandomAchievement,
    dismissAchievement
  }
}