'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Users, Award, Target, DollarSign, Zap } from 'lucide-react'

const baseMetrics = [
  {
    title: "Total Revenue",
    baseValue: 2145678,
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "Revenue this month",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-950/20"
  },
  {
    title: "Employee Points",
    baseValue: 45231,
    change: "+8.2%",
    trend: "up", 
    icon: Award,
    description: "Points awarded this month",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-950/20"
  },
  {
    title: "Active Users",
    baseValue: 573,
    change: "+15",
    trend: "up",
    icon: Users,
    description: "Active participants",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-950/20"
  },
  {
    title: "Goals Achieved",
    baseValue: 89,
    change: "-2.1%",
    trend: "down",
    icon: Target,
    description: "Goals completed this quarter",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-950/20",
    suffix: "%"
  }
]

export function MetricsOverview() {
  const [metrics, setMetrics] = useState(baseMetrics.map(m => ({ ...m, currentValue: m.baseValue })))
  const [isLoading, setIsLoading] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    setIsLoading(false)
    
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        currentValue: metric.baseValue + Math.floor(Math.random() * 50 - 25)
      })))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatValue = (value: number, title: string, suffix?: string) => {
    if (title === "Total Revenue") {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (title === "Employee Points") {
      return value.toLocaleString()
    }
    return `${value}${suffix || ''}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass-card group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metric.title}
              </CardTitle>
              <motion.div
                className={`p-2 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}
                whileHover={{ rotate: 5 }}
              >
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div 
                className={`text-3xl font-bold ${metric.color}`}
                key={metric.currentValue}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <div className="loading-skeleton h-8 w-24"></div>
                ) : (
                  formatValue(metric.currentValue, metric.title, metric.suffix)
                )}
              </motion.div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={metric.trend === "up" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {metric.change}
                  </span>
                </div>
                
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
