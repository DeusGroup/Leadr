'use client'

import { useState, useEffect } from 'react'
import Joyride from 'react-joyride'
import type { Step, CallBackProps } from 'react-joyride'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, CheckCircle, Play, SkipForward } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingTourProps {
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTour({ isActive, onComplete, onSkip }: OnboardingTourProps) {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [showTooltip, setShowTooltip] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  const steps: Step[] = [
    {
      target: '.metrics-overview',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">📊 Metrics Overview</h3>
          <p>This dashboard shows your key performance metrics at a glance. Track your progress and see how you're performing compared to your goals.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Real-time updates every few seconds
          </div>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '.predictive-insights',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🧠 AI Predictions</h3>
          <p>Our AI analyzes your patterns to predict future performance and identify potential risks or opportunities.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Confidence scores and actionable insights
          </div>
        </div>
      ),
      placement: 'top'
    },
    {
      target: '.leaderboard-filters',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🔍 Smart Filters</h3>
          <p>Use these filters to customize your view. Filter by time period, department, or view type to focus on what matters most.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Your preferences are automatically saved
          </div>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '.activity-feed',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">⚡ Live Activity</h3>
          <p>Stay updated with real-time achievements and milestones from your team. Enable sound notifications for important events!</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Updates every 4 seconds with confetti for celebrations
          </div>
        </div>
      ),
      placement: 'left'
    },
    {
      target: '.nav-menu',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🧭 Navigation</h3>
          <p>Access different sections of the platform from here. Switch between employee recognition, sales tracking, and admin functions.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Your current section is highlighted
          </div>
        </div>
      ),
      placement: 'right'
    }
  ]

  // Prevent hydration issues by only rendering on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isActive && isMounted) {
      setRun(true)
      setStepIndex(0)
    }
  }, [isActive, isMounted])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, action, index } = data

    if (['finished', 'skipped'].includes(status)) {
      setRun(false)
      onComplete()
    } else if (type === 'step:after') {
      setStepIndex(index + (action === 'prev' ? -1 : 1))
    }
  }

  const handleSkip = () => {
    setRun(false)
    onSkip()
  }

  // Prevent hydration errors by only rendering on client
  if (!isActive || !isMounted) return null

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        disableOverlayClose
        styles={{
          options: {
            primaryColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#374151',
            zIndex: 1000,
          },
          tooltip: {
            borderRadius: 8,
            fontSize: 14,
          },
          tooltipContent: {
            padding: '20px',
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            fontSize: 14,
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: 14,
          },
          buttonSkip: {
            color: '#6b7280',
            fontSize: 14,
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish Tour',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />

      {/* Custom tour progress indicator */}
      <AnimatePresence>
        {run && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 z-50"
          >
            <Card className="w-80 shadow-lg border-blue-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Getting Started Tour</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Step {stepIndex + 1} of {steps.length}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(((stepIndex + 1) / steps.length) * 100)}% Complete
                  </Badge>
                </div>
                <Progress 
                  value={((stepIndex + 1) / steps.length) * 100} 
                  className="h-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 text-xs"
                  >
                    <SkipForward className="w-3 h-3 mr-1" />
                    Skip Tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for managing onboarding state
export function useOnboarding() {
  const [hasCompletedTour, setHasCompletedTour] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding-tour-completed')
    setHasCompletedTour(completed === 'true')
    
    // Show onboarding for new users after a short delay
    if (!completed) {
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const completeTour = () => {
    localStorage.setItem('onboarding-tour-completed', 'true')
    setHasCompletedTour(true)
    setShowOnboarding(false)
  }

  const skipTour = () => {
    localStorage.setItem('onboarding-tour-completed', 'true')
    setHasCompletedTour(true)
    setShowOnboarding(false)
  }

  const restartTour = () => {
    setShowOnboarding(true)
  }

  return {
    hasCompletedTour,
    showOnboarding,
    completeTour,
    skipTour,
    restartTour
  }
}