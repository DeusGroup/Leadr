'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Trophy, 
  Target, 
  Users, 
  TrendingUp,
  PlayCircle,
  CheckSquare,
  ArrowRight
} from 'lucide-react'

interface OnboardingWelcomeProps {
  isVisible: boolean
  onStartTour: () => void
  onShowChecklist: () => void
  onSkip: () => void
}

export function OnboardingWelcome({ 
  isVisible, 
  onStartTour, 
  onShowChecklist, 
  onSkip 
}: OnboardingWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const features = [
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: "Employee Recognition",
      description: "Track achievements, points, and celebrate team accomplishments in real-time"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "Sales Performance",
      description: "Monitor revenue, deals, and sales metrics with advanced analytics"
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Smart Insights",
      description: "AI-powered predictions and recommendations to optimize performance"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Team Collaboration",
      description: "Foster engagement with leaderboards, filters, and activity feeds"
    }
  ]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl"
      >
        <Card className="relative overflow-hidden border-2 border-blue-200 shadow-2xl">
          {/* Header */}
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="mx-auto mb-4"
            >
              <Sparkles className="w-16 h-16" />
            </motion.div>
            <CardTitle className="text-3xl font-bold mb-2">
              Welcome to the Unified Leaderboard Platform! 🎉
            </CardTitle>
            <p className="text-blue-100 text-lg">
              Your all-in-one solution for employee recognition and sales performance tracking
            </p>
            <Badge className="bg-white/20 text-white border-white/30 mt-4">
              🚀 Enterprise Edition
            </Badge>
          </CardHeader>

          <CardContent className="p-8">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.5 
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 rounded-lg border mb-8"
            >
              <h3 className="font-semibold text-center mb-3">Platform Highlights</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">Real-time</div>
                  <div className="text-xs text-muted-foreground">Updates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">AI-powered</div>
                  <div className="text-xs text-muted-foreground">Insights</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">Smart</div>
                  <div className="text-xs text-muted-foreground">Filtering</div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={onStartTour}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Interactive Tour
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                onClick={onShowChecklist}
                size="lg"
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                <CheckSquare className="w-5 h-5 mr-2" />
                View Checklist
              </Button>
              
              <Button
                onClick={onSkip}
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for Now
              </Button>
            </motion.div>

            {/* Demo Data Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center"
            >
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ✨ <strong>Demo Mode:</strong> We've pre-loaded sample data so you can explore all features immediately!
              </p>
            </motion.div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="w-24 h-24 text-yellow-500" />
              </motion.div>
            </div>
            <div className="absolute bottom-4 left-4 opacity-10">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <Target className="w-20 h-20 text-blue-500" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}