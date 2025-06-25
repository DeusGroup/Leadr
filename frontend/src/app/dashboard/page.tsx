'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeLeaderboard } from '@/components/leaderboards/employee-leaderboard'
import { SalesLeaderboard } from '@/components/leaderboards/sales-leaderboard'
import { MetricsOverview } from '@/components/dashboard/metrics-overview'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { PredictiveInsights } from '@/components/dashboard/PredictiveInsights'
import { OnboardingTour, useOnboarding } from '@/components/onboarding/OnboardingTour'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome'
import { Award, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [showChecklist, setShowChecklist] = useState(false)
  const { 
    hasCompletedTour, 
    showOnboarding, 
    completeTour, 
    skipTour, 
    restartTour 
  } = useOnboarding()

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex-shrink-0 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Enterprise Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time insights • AI-powered analytics • Enhanced user experience
        </p>
      </div>

      <div className="metrics-overview">
        <MetricsOverview />
      </div>

      {/* Predictive Insights */}
      <div className="predictive-insights">
        <PredictiveInsights />
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
        <div className="xl:col-span-2 flex flex-col min-h-0">
          <Tabs defaultValue="employee" className="flex flex-col h-full">
            <TabsList className="leaderboard-filters grid w-full grid-cols-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-0 p-1 flex-shrink-0">
              <TabsTrigger 
                value="employee" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                Employee Recognition
              </TabsTrigger>
              <TabsTrigger 
                value="sales"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                Sales Performance
              </TabsTrigger>
            </TabsList>
            <TabsContent value="employee" className="flex-1 mt-4">
              <Card className="glass-card border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    Employee Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top performers in employee recognition and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <EmployeeLeaderboard />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sales" className="flex-1 mt-4">
              <Card className="glass-card border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Sales Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top performers in sales metrics and revenue generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <SalesLeaderboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="activity-feed flex flex-col">
          <ActivityFeed />
        </div>
      </div>

      {/* Onboarding Components */}
      <OnboardingWelcome
        isVisible={showOnboarding}
        onStartTour={() => {
          completeTour()
          restartTour()
        }}
        onShowChecklist={() => {
          completeTour()
          setShowChecklist(true)
        }}
        onSkip={skipTour}
      />

      <OnboardingTour
        isActive={!showOnboarding && !hasCompletedTour}
        onComplete={completeTour}
        onSkip={skipTour}
      />

      <OnboardingChecklist
        isVisible={showChecklist}
        onClose={() => setShowChecklist(false)}
        onStartTour={restartTour}
      />
    </div>
  )
}
