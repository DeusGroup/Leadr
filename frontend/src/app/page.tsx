import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Target, Award } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight lg:text-6xl mb-4">
          Unified Leaderboard Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Combine employee recognition and sales performance tracking in one powerful, 
          real-time platform that drives engagement and results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="employee-metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Recognition</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="sales-metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.1M</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Achieved</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Employee Recognition Leaderboard</CardTitle>
            <CardDescription>
              Track achievements, points, and employee engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                • Points-based achievement system
              </p>
              <p className="text-sm text-muted-foreground">
                • Real-time updates and notifications
              </p>
              <p className="text-sm text-muted-foreground">
                • Department and team analytics
              </p>
              <Link href="/employee-leaderboard">
                <Button className="w-full">View Employee Leaderboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Performance Tracking</CardTitle>
            <CardDescription>
              Monitor revenue, deals, and sales team performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                • Revenue and deal tracking
              </p>
              <p className="text-sm text-muted-foreground">
                • Weighted scoring algorithms
              </p>
              <p className="text-sm text-muted-foreground">
                • Goal setting and progress monitoring
              </p>
              <Link href="/sales-leaderboard">
                <Button className="w-full">View Sales Leaderboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/dashboard">
          <Button size="lg" className="mr-4">
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/admin">
          <Button variant="outline" size="lg">
            Admin Panel
          </Button>
        </Link>
      </div>
    </div>
  )
}
