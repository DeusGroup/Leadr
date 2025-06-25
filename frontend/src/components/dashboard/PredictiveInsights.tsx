'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  Zap,
  Activity
} from 'lucide-react'

interface Prediction {
  id: string
  type: 'trend' | 'risk' | 'recommendation' | 'forecast'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  impact: 'positive' | 'negative' | 'neutral'
  timeframe: string
  actionable: boolean
  data?: any
}

interface TeamHealthMetric {
  category: string
  score: number
  trend: 'up' | 'down' | 'stable'
  details: string[]
}

interface PredictiveInsightsProps {
  department?: string
  timeRange?: string
  refreshInterval?: number
}

export function PredictiveInsights({ 
  department = 'all',
  timeRange = 'monthly',
  refreshInterval = 0 
}: PredictiveInsightsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [teamHealth, setTeamHealth] = useState<TeamHealthMetric[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Mock prediction generator
  const generatePredictions = (): Prediction[] => {
    const employees = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez', 'Jessica Kim']
    const departments = ['Sales', 'Engineering', 'Marketing', 'Support']
    
    const mockPredictions: Prediction[] = [
      {
        id: 'trend-1',
        type: 'trend',
        severity: 'high',
        title: `${employees[Math.floor(Math.random() * employees.length)]} on track to exceed monthly goal`,
        description: `Based on current performance patterns, likely to exceed target by ${15 + Math.floor(Math.random() * 20)}%`,
        confidence: 85 + Math.floor(Math.random() * 10),
        impact: 'positive',
        timeframe: 'Next 7 days',
        actionable: true
      },
      {
        id: 'risk-1',
        type: 'risk',
        severity: 'medium',
        title: `${Math.floor(2 + Math.random() * 4)} team members inactive`,
        description: `Haven't logged activity in ${24 + Math.floor(Math.random() * 48)} hours. May need engagement boost`,
        confidence: 92,
        impact: 'negative',
        timeframe: 'Current',
        actionable: true
      },
      {
        id: 'recommendation-1',
        type: 'recommendation',
        severity: 'low',
        title: 'Optimize team collaboration',
        description: `${departments[Math.floor(Math.random() * departments.length)]} department could benefit from cross-functional projects`,
        confidence: 78,
        impact: 'positive',
        timeframe: 'Next month',
        actionable: true
      },
      {
        id: 'forecast-1',
        type: 'forecast',
        severity: 'high',
        title: 'Q4 performance projection',
        description: `Current trajectory suggests ${85 + Math.floor(Math.random() * 20)}% goal achievement likelihood`,
        confidence: 89,
        impact: 'positive',
        timeframe: 'End of quarter',
        actionable: false
      },
      {
        id: 'risk-2',
        type: 'risk',
        severity: 'critical',
        title: 'Burnout risk detected',
        description: `${employees[Math.floor(Math.random() * employees.length)]} showing signs of overwork - consider workload adjustment`,
        confidence: 91,
        impact: 'negative',
        timeframe: 'Next 2 weeks',
        actionable: true
      }
    ]

    return mockPredictions.slice(0, 3 + Math.floor(Math.random() * 3))
  }

  // Mock team health data
  const generateTeamHealth = (): TeamHealthMetric[] => {
    return [
      {
        category: 'Engagement',
        score: 82 + Math.floor(Math.random() * 15),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        details: ['Daily active users up 12%', 'Average session time increased', '3 new achievements unlocked']
      },
      {
        category: 'Productivity',
        score: 78 + Math.floor(Math.random() * 18),
        trend: Math.random() > 0.3 ? 'up' : 'stable',
        details: ['Tasks completed on time', 'Goal completion rate improved', 'Team velocity steady']
      },
      {
        category: 'Collaboration',
        score: 74 + Math.floor(Math.random() * 20),
        trend: Math.random() > 0.4 ? 'up' : 'down',
        details: ['Cross-team projects active', 'Knowledge sharing increased', 'Peer recognition up']
      },
      {
        category: 'Well-being',
        score: 88 + Math.floor(Math.random() * 10),
        trend: 'stable',
        details: ['Work-life balance maintained', 'Stress levels normal', 'Team satisfaction high']
      }
    ]
  }

  // Load predictions
  useEffect(() => {
    const newPredictions = generatePredictions()
    const newTeamHealth = generateTeamHealth()
    
    setPredictions(newPredictions)
    setTeamHealth(newTeamHealth)
    
    // Calculate overall score
    const avgScore = newTeamHealth.reduce((sum, metric) => sum + metric.score, 0) / newTeamHealth.length
    setOverallScore(Math.round(avgScore))
  }, [])

  const getSeverityColor = (severity: Prediction['severity']) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
    }
  }

  const getTypeIcon = (type: Prediction['type']) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />
      case 'risk': return <AlertTriangle className="w-4 h-4" />
      case 'recommendation': return <Lightbulb className="w-4 h-4" />
      case 'forecast': return <Activity className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: TeamHealthMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'stable': return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <>
      {/* CSS for ticker animation */}
      <style jsx>{`
        .ticker-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        
        .ticker-content {
          display: flex;
          align-items: center;
          height: 100%;
          animation: scroll-left 60s linear infinite;
          white-space: nowrap;
        }
        
        .ticker-item {
          display: inline-flex;
          align-items: center;
          height: 100%;
          flex-shrink: 0;
          min-width: 400px;
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Ticker Insights */}
        <Card className="glass-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Performance Insights
              <Badge variant="outline" className="ml-auto">
                Live Feed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-64 overflow-hidden border-t border-gray-200 dark:border-gray-700">
              <div className="ticker-container">
                <div className="ticker-content">
                  {predictions.map((prediction, index) => (
                    <div
                      key={`${prediction.id}-1`}
                      className="ticker-item flex items-center gap-4 px-6 py-4 border-r border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${prediction.severity === 'critical' ? 'bg-red-500' :
                            prediction.severity === 'high' ? 'bg-orange-500' :
                            prediction.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }
                        `} />
                        {getTypeIcon(prediction.type)}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span className="font-semibold text-sm mr-2">{prediction.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {prediction.description}
                        </span>
                        <span className="text-xs text-blue-600 ml-2">
                          {prediction.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {predictions.map((prediction, index) => (
                    <div
                      key={`${prediction.id}-2`}
                      className="ticker-item flex items-center gap-4 px-6 py-4 border-r border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`
                          w-2 h-2 rounded-full
                          ${prediction.severity === 'critical' ? 'bg-red-500' :
                            prediction.severity === 'high' ? 'bg-orange-500' :
                            prediction.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }
                        `} />
                        {getTypeIcon(prediction.type)}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span className="font-semibold text-sm mr-2">{prediction.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {prediction.description}
                        </span>
                        <span className="text-xs text-blue-600 ml-2">
                          {prediction.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Health Score */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Team Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Health</p>
              
              {/* Health indicator */}
              <div className="mt-2">
                <Badge 
                  className={
                    overallScore >= 90 ? 'bg-green-100 text-green-800' :
                    overallScore >= 80 ? 'bg-blue-100 text-blue-800' :
                    overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                  variant="outline"
                >
                  {overallScore >= 90 ? 'Excellent' :
                   overallScore >= 80 ? 'Good' :
                   overallScore >= 70 ? 'Fair' : 'Needs Attention'}
                </Badge>
              </div>
            </div>

            {/* Individual Metrics */}
            <div className="space-y-4">
              {teamHealth.map((metric, index) => (
                <motion.div
                  key={metric.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getScoreColor(metric.score)}`}>
                        {metric.score}%
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  
                  <Progress 
                    value={metric.score} 
                    className="h-2"
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    {metric.details.slice(0, 2).map((detail, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Static indicator */}
            <div className="mt-4 pt-4 border-t text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                Live ticker feed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}