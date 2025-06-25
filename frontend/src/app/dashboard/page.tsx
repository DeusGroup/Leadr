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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor performance across employee recognition and sales metrics
        </p>
      </div>

      <div className="metrics-overview">
        <MetricsOverview />
      </div>

      {/* Predictive Insights */}
      <div className="predictive-insights">
        <PredictiveInsights />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="employee" className="space-y-4">
            <TabsList className="leaderboard-filters">
              <TabsTrigger value="employee">Employee Recognition</TabsTrigger>
              <TabsTrigger value="sales">Sales Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="employee">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Leaderboard</CardTitle>
                  <CardDescription>
                    Top performers in employee recognition and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeLeaderboard />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Leaderboard</CardTitle>
                  <CardDescription>
                    Top performers in sales metrics and revenue generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesLeaderboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="activity-feed">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed />
            </CardContent>
          </Card>
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
