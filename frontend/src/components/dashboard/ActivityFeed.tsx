'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Star, TrendingUp, Users, Target, Award, Zap } from 'lucide-react'
import Confetti from 'react-confetti'

interface ActivityItem {
  id: string
  type: 'achievement' | 'milestone' | 'streak' | 'goal' | 'promotion' | 'collaboration'
  user: {
    name: string
    avatar?: string
    department: string
  }
  title: string
  description: string
  points?: number
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
}

interface ActivityFeedProps {
  maxItems?: number
  autoRefresh?: boolean
  showConfetti?: boolean
}

export function ActivityFeed({ 
  maxItems = 10, 
  autoRefresh = true,
  showConfetti = true 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [showConfettiEffect, setShowConfettiEffect] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Mock activity data generator
  const generateActivity = (): ActivityItem => {
    const users = [
      { name: 'Sarah Johnson', department: 'Sales' },
      { name: 'Mike Chen', department: 'Engineering' },
      { name: 'Emily Davis', department: 'Marketing' },
      { name: 'Alex Rodriguez', department: 'Support' },
      { name: 'Jessica Kim', department: 'Sales' },
    ]

    const activityTypes = [
      {
        type: 'achievement' as const,
        titles: ['First Sale of the Month!', 'Code Review Master', 'Customer Hero', 'Team Player'],
        descriptions: ['Closed their first deal this month', 'Completed 50 code reviews', 'Resolved 100 tickets', 'Helped 5 team members'],
        points: [100, 150, 200, 250]
      },
      {
        type: 'milestone' as const,
        titles: ['1000 Points!', '50 Day Streak!', 'Department Leader', 'Rising Star'],
        descriptions: ['Reached 1000 total points', 'Maintained 50-day activity streak', 'Became top performer in department', 'Fastest growing this quarter'],
        points: [500, 300, 400, 350]
      },
      {
        type: 'streak' as const,
        titles: ['Week Warrior', 'Monthly Champion', 'Consistency King', 'Daily Driver'],
        descriptions: ['7 days of consistent activity', '30 days without missing a day', 'Longest streak this quarter', '5 days of perfect scores'],
        points: [75, 200, 300, 100]
      }
    ]

    const randomUser = users[Math.floor(Math.random() * users.length)]
    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    const randomIndex = Math.floor(Math.random() * randomType.titles.length)

    return {
      id: `activity-${Date.now()}-${Math.random()}`,
      type: randomType.type,
      user: randomUser,
      title: randomType.titles[randomIndex],
      description: randomType.descriptions[randomIndex],
      points: randomType.points[randomIndex],
      timestamp: new Date(),
      priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }
  }

  // Initialize with some activities
  useEffect(() => {
    const initialActivities = Array.from({ length: 5 }, generateActivity)
    setActivities(initialActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
  }, [])

  // Auto-refresh activities
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      const newActivity = generateActivity()
      
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, maxItems)
        
        // Trigger confetti for high priority activities
        if (newActivity.priority === 'high' && showConfetti) {
          setShowConfettiEffect(true)
          setTimeout(() => setShowConfettiEffect(false), 3000)
        }

        // Play sound if enabled
        if (soundEnabled && newActivity.priority !== 'low') {
          playNotificationSound()
        }

        return updated
      })
    }, 4000) // New activity every 4 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, maxItems, showConfetti, soundEnabled])

  const playNotificationSound = () => {
    // Create a simple audio context for achievement sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />
      case 'milestone': return <Star className="w-4 h-4 text-purple-500" />
      case 'streak': return <Zap className="w-4 h-4 text-orange-500" />
      case 'goal': return <Target className="w-4 h-4 text-green-500" />
      case 'promotion': return <Award className="w-4 h-4 text-blue-500" />
      case 'collaboration': return <Users className="w-4 h-4 text-pink-500" />
      default: return <Star className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <>
      {showConfettiEffect && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <Card className="glass-card h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-orange-500" />
              </motion.div>
              Live Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-full transition-colors ${
                  soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                🔊
              </button>
              <Badge 
                variant={autoRefresh ? "default" : "secondary"}
                className="text-xs"
              >
                {autoRefresh ? 'Live' : 'Paused'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index === 0 ? 0.2 : 0 
                  }}
                  className={`
                    p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md
                    ${getPriorityColor(activity.priority)}
                  `}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <motion.div
                      className="mt-1"
                      animate={{ 
                        scale: activity.priority === 'high' ? [1, 1.2, 1] : 1,
                        rotate: activity.priority === 'high' ? [0, 10, -10, 0] : 0
                      }}
                      transition={{ 
                        duration: 0.5,
                        repeat: activity.priority === 'high' ? Infinity : 0,
                        repeatDelay: 2
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </motion.div>

                    {/* Avatar */}
                    <Avatar className="w-8 h-8 mt-0.5">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                        {getInitials(activity.user.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {activity.user.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {activity.user.department}
                        </Badge>
                        {activity.points && (
                          <motion.span 
                            className="text-xs font-medium text-yellow-600 dark:text-yellow-400"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            +{activity.points}
                          </motion.span>
                        )}
                      </div>
                      <p className="font-medium text-sm text-foreground mb-1">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}