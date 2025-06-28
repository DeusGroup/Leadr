'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Star, TrendingUp, Zap, Award, DollarSign } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface ActivityItem {
  id: string
  type: 'achievement_earned' | 'metric_added'
  user: {
    firstName: string
    lastName: string
    avatar?: string
  }
  message: string
  metricType?: string
  value?: number
  achievement?: {
    name: string
    description?: string
    icon?: string
  }
  timestamp: string
}

interface ActivityFeedProps {
  maxItems?: number
}

export function ActivityFeed({ maxItems = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Connect to Socket.IO server only on client
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    // Listen for new activities
    newSocket.on('new-activity', (activity: any) => {
      const newActivity: ActivityItem = {
        id: `activity-${Date.now()}-${Math.random()}`,
        ...activity
      }

      setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)])
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [maxItems, isMounted])

  const getActivityIcon = (type: ActivityItem['type'], metricType?: string) => {
    if (type === 'achievement_earned') {
      return <Trophy className="w-4 h-4 text-yellow-500" />
    }
    
    if (type === 'metric_added') {
      switch (metricType) {
        case 'revenue': return <DollarSign className="w-4 h-4 text-green-500" />
        case 'points': return <Star className="w-4 h-4 text-blue-500" />
        case 'deals': return <TrendingUp className="w-4 h-4 text-purple-500" />
        default: return <Award className="w-4 h-4 text-orange-500" />
      }
    }
    
    return <Zap className="w-4 h-4 text-gray-500" />
  }

  const getBadgeColor = (type: ActivityItem['type']) => {
    return type === 'achievement_earned' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="glass-card border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Live Activity Feed
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Real-time updates</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Waiting for live activities...</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm border border-white/20"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>
                    {activity.user.firstName[0]}{activity.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.type, activity.metricType)}
                    <Badge className={`text-xs ${getBadgeColor(activity.type)}`}>
                      {activity.type === 'achievement_earned' ? 'Achievement' : 'Metric'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                    {activity.message}
                  </p>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}