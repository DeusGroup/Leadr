'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, Zap, Star } from 'lucide-react'

interface ProgressData {
  label: string
  current: number
  target: number
  color: string
  icon: React.ReactNode
  unit?: string
}

interface AnimatedProgressProps {
  data: ProgressData[]
  title?: string
  animationDelay?: number
  showSparkles?: boolean
}

export function AnimatedProgress({ 
  data, 
  title = "Goal Progress",
  animationDelay = 0.2,
  showSparkles = true 
}: AnimatedProgressProps) {
  const [animatedValues, setAnimatedValues] = useState<number[]>(data.map(() => 0))

  useEffect(() => {
    data.forEach((item, index) => {
      const timer = setTimeout(() => {
        setAnimatedValues(prev => {
          const newValues = [...prev]
          newValues[index] = item.current
          return newValues
        })
      }, index * animationDelay * 1000)

      return () => clearTimeout(timer)
    })
  }, [data, animationDelay])

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const isGoalAchieved = (current: number, target: number) => {
    return current >= target
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((item, index) => {
            const percentage = getProgressPercentage(animatedValues[index], item.target)
            const achieved = isGoalAchieved(animatedValues[index], item.target)
            
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * animationDelay }}
                className="space-y-2"
              >
                {/* Label and Values */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={achieved ? { 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      } : {}}
                      transition={{ 
                        duration: 0.8,
                        repeat: achieved ? Infinity : 0,
                        repeatDelay: 3
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {achieved && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✓ Achieved
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  <div className="text-right">
                    <motion.span 
                      className="font-bold text-sm"
                      key={animatedValues[index]}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {animatedValues[index].toLocaleString()}{item.unit}
                    </motion.span>
                    <span className="text-muted-foreground text-sm">
                      {" / "}{item.target.toLocaleString()}{item.unit}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full relative ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ 
                        duration: 1.2,
                        delay: index * animationDelay,
                        ease: "easeOut"
                      }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut"
                        }}
                        style={{ width: '50%' }}
                      />
                    </motion.div>
                  </div>

                  {/* Percentage Label */}
                  <motion.div
                    className="absolute right-0 -top-6 text-xs font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * animationDelay + 0.5 }}
                  >
                    {percentage.toFixed(0)}%
                  </motion.div>

                  {/* Sparkles for achieved goals */}
                  {achieved && showSparkles && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                          style={{
                            left: `${10 + (i * 20)}%`,
                            top: '50%',
                          }}
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 1,
                            delay: i * 0.2,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Milestone markers */}
                <div className="relative h-1">
                  {[25, 50, 75].map((milestone) => (
                    <div
                      key={milestone}
                      className="absolute w-0.5 h-3 bg-gray-400 -top-1"
                      style={{ left: `${milestone}%` }}
                    >
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                        {milestone}%
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Overall Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: data.length * animationDelay + 0.5 }}
          className="mt-6 pt-4 border-t"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Goals Achieved: {data.filter((item, i) => isGoalAchieved(animatedValues[i], item.target)).length} / {data.length}
            </span>
            <div className="flex items-center gap-1">
              {data.filter((item, i) => isGoalAchieved(animatedValues[i], item.target)).length === data.length ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </motion.div>
              ) : (
                <Zap className="w-4 h-4 text-orange-500" />
              )}
              <span className="text-sm font-medium">
                {data.filter((item, i) => isGoalAchieved(animatedValues[i], item.target)).length === data.length 
                  ? "All Complete!" 
                  : "In Progress"
                }
              </span>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

// Example usage component
export function ProgressDashboard() {
  const progressData: ProgressData[] = [
    {
      label: "Monthly Sales Target",
      current: 85000,
      target: 100000,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: <Trophy className="w-4 h-4 text-blue-500" />,
      unit: ""
    },
    {
      label: "Team Collaboration",
      current: 42,
      target: 50,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      icon: <Star className="w-4 h-4 text-green-500" />,
      unit: " tasks"
    },
    {
      label: "Activity Streak",
      current: 28,
      target: 30,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      icon: <Zap className="w-4 h-4 text-orange-500" />,
      unit: " days"
    },
    {
      label: "Skill Development",
      current: 8,
      target: 10,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: <Target className="w-4 h-4 text-purple-500" />,
      unit: " courses"
    }
  ]

  return (
    <AnimatedProgress 
      data={progressData}
      title="Goal Progress Dashboard"
      animationDelay={0.3}
      showSparkles={true}
    />
  )
}