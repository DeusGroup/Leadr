'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Circle, 
  Trophy, 
  Star, 
  Target, 
  Users, 
  Settings,
  PlayCircle,
  X,
  Sparkles
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  points: number
  category: 'getting-started' | 'engagement' | 'advanced'
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingChecklistProps {
  isVisible: boolean
  onClose: () => void
  onStartTour: () => void
}

export function OnboardingChecklist({ isVisible, onClose, onStartTour }: OnboardingChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const initialItems: ChecklistItem[] = [
    {
      id: 'tour',
      title: 'Complete the guided tour',
      description: 'Learn how to navigate the platform with our interactive guide',
      icon: <PlayCircle className="w-5 h-5 text-blue-500" />,
      completed: false,
      points: 100,
      category: 'getting-started',
      action: {
        label: 'Start Tour',
        onClick: onStartTour
      }
    },
    {
      id: 'profile',
      title: 'Set up your profile',
      description: 'Add your photo and update your information',
      icon: <Users className="w-5 h-5 text-green-500" />,
      completed: false,
      points: 50,
      category: 'getting-started'
    },
    {
      id: 'first-interaction',
      title: 'Interact with the dashboard',
      description: 'Click on metrics, use filters, or check the activity feed',
      icon: <Target className="w-5 h-5 text-purple-500" />,
      completed: false,
      points: 75,
      category: 'engagement'
    },
    {
      id: 'leaderboard-view',
      title: 'Explore leaderboards',
      description: 'Check out both employee and sales leaderboards',
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      completed: false,
      points: 75,
      category: 'engagement'
    },
    {
      id: 'filters',
      title: 'Use smart filters',
      description: 'Try different time periods and department filters',
      icon: <Settings className="w-5 h-5 text-gray-500" />,
      completed: false,
      points: 100,
      category: 'advanced'
    },
    {
      id: 'achievements',
      title: 'Unlock your first achievement',
      description: 'Complete any action to earn your first badge',
      icon: <Star className="w-5 h-5 text-orange-500" />,
      completed: false,
      points: 150,
      category: 'engagement'
    }
  ]

  useEffect(() => {
    // Load completion state from localStorage
    const savedProgress = localStorage.getItem('onboarding-checklist')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      const updatedItems = initialItems.map(item => ({
        ...item,
        completed: progress[item.id] || false
      }))
      setItems(updatedItems)
      
      // Calculate total points
      const points = updatedItems
        .filter(item => item.completed)
        .reduce((sum, item) => sum + item.points, 0)
      setTotalPoints(points)
    } else {
      setItems(initialItems)
    }
  }, [])

  const completeItem = (itemId: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, completed: true } : item
      )
      
      // Save to localStorage
      const progress = Object.fromEntries(
        updated.map(item => [item.id, item.completed])
      )
      localStorage.setItem('onboarding-checklist', JSON.stringify(progress))
      
      // Update total points
      const points = updated
        .filter(item => item.completed)
        .reduce((sum, item) => sum + item.points, 0)
      setTotalPoints(points)
      
      // Show celebration for major milestones
      const completedCount = updated.filter(item => item.completed).length
      if (completedCount === updated.length || completedCount % 3 === 0) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
      
      return updated
    })
  }

  const getCompletionPercentage = () => {
    const completed = items.filter(item => item.completed).length
    return Math.round((completed / items.length) * 100)
  }

  const getCategoryItems = (category: ChecklistItem['category']) => {
    return items.filter(item => item.category === category)
  }

  const getCategoryCompletion = (category: ChecklistItem['category']) => {
    const categoryItems = getCategoryItems(category)
    const completed = categoryItems.filter(item => item.completed).length
    return categoryItems.length > 0 ? Math.round((completed / categoryItems.length) * 100) : 0
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Getting Started Checklist
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete these tasks to unlock the full potential of the platform
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Overall Progress */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {items.filter(item => item.completed).length} / {items.length}
                    </Badge>
                    <span className="font-medium">{getCompletionPercentage()}%</span>
                  </div>
                </div>
                <Progress value={getCompletionPercentage()} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Points Earned: {totalPoints}</span>
                  <span>Max Points: {items.reduce((sum, item) => sum + item.points, 0)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Getting Started */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">🚀 Getting Started</h3>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryCompletion('getting-started')}% Complete
                  </Badge>
                </div>
                <div className="space-y-2">
                  {getCategoryItems('getting-started').map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onComplete={completeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Engagement */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">💫 Engagement</h3>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryCompletion('engagement')}% Complete
                  </Badge>
                </div>
                <div className="space-y-2">
                  {getCategoryItems('engagement').map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onComplete={completeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Advanced */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">⚡ Advanced Features</h3>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryCompletion('advanced')}% Complete
                  </Badge>
                </div>
                <div className="space-y-2">
                  {getCategoryItems('advanced').map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onComplete={completeItem}
                    />
                  ))}
                </div>
              </div>
            </CardContent>

            {/* Celebration Effect */}
            {showCelebration && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="text-6xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                >
                  🎉
                </motion.div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ChecklistItemComponent({ 
  item, 
  onComplete 
}: { 
  item: ChecklistItem
  onComplete: (id: string) => void 
}) {
  const handleClick = () => {
    if (!item.completed) {
      if (item.action) {
        item.action.onClick()
      }
      onComplete(item.id)
    }
  }

  return (
    <motion.div
      className={`
        p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${item.completed 
          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
          : 'bg-card border-border hover:border-primary/50'
        }
      `}
      onClick={handleClick}
      whileHover={{ scale: item.completed ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={item.completed ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {item.completed ? (
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
          )}
        </motion.div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {item.icon}
            <h4 className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
              {item.title}
            </h4>
            <Badge variant="secondary" className="text-xs">
              +{item.points}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {item.description}
          </p>
          {item.action && !item.completed && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs mt-2"
              onClick={(e) => {
                e.stopPropagation()
                item.action?.onClick()
              }}
            >
              {item.action.label}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}