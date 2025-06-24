'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: number
  type: 'achievement' | 'sales' | 'goal'
  user: string
  action: string
  value?: string
  timestamp: Date
  avatar?: string
}

const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'achievement',
    user: 'Sarah Johnson',
    action: 'earned Employee of the Month',
    value: '500 points',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 2,
    type: 'sales',
    user: 'Michael Chen',
    action: 'closed a major deal',
    value: '$45,000',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 3,
    type: 'goal',
    user: 'Emily Rodriguez',
    action: 'completed quarterly goal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: 4,
    type: 'achievement',
    user: 'David Thompson',
    action: 'reached 1000 points milestone',
    value: '100 bonus points',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: 5,
    type: 'sales',
    user: 'Lisa Wang',
    action: 'exceeded monthly target',
    value: '120% of goal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  }
]

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'achievement':
      return '🏆'
    case 'sales':
      return '💰'
    case 'goal':
      return '🎯'
    default:
      return '📈'
  }
}

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'achievement':
      return 'default'
    case 'sales':
      return 'secondary'
    case 'goal':
      return 'outline'
    default:
      return 'outline'
  }
}

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {mockActivities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.avatar} alt={activity.user} />
            <AvatarFallback>
              {activity.user.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getActivityIcon(activity.type)}</span>
              <Badge variant={getActivityColor(activity.type)} className="text-xs">
                {activity.type}
              </Badge>
            </div>

            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              <span className="font-medium">{activity.user}</span>{' '}
              {activity.action}
              {activity.value && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {' '}({activity.value})
                </span>
              )}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
