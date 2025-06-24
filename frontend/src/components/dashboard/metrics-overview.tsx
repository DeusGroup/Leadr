'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Award, Target, DollarSign } from 'lucide-react'

const metrics = [
  {
    title: "Total Revenue",
    value: "$2,145,678",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "Revenue this month"
  },
  {
    title: "Employee Points",
    value: "45,231",
    change: "+8.2%",
    trend: "up", 
    icon: Award,
    description: "Points awarded this month"
  },
  {
    title: "Active Users",
    value: "573",
    change: "+15",
    trend: "up",
    icon: Users,
    description: "Active participants"
  },
  {
    title: "Goals Achieved",
    value: "89%",
    change: "-2.1%",
    trend: "down",
    icon: Target,
    description: "Goals completed this quarter"
  }
]

export function MetricsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                {metric.change}
              </span>
              <span>from last month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
