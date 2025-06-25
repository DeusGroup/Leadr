'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp, Filter, MapPin } from 'lucide-react'

export interface FilterState {
  timeRange: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  department: 'all' | 'sales' | 'engineering' | 'marketing' | 'support'
  view: 'all' | 'near-me' | 'top-10'
  metric: 'points' | 'achievements' | 'activity' | 'growth'
}

interface LeaderboardFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  currentUserRank?: number
  isLoading?: boolean
}

export function LeaderboardFilters({ 
  filters, 
  onFilterChange, 
  currentUserRank,
  isLoading = false 
}: LeaderboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const timeRanges = [
    { value: 'daily', label: 'Today', icon: Calendar },
    { value: 'weekly', label: 'This Week', icon: Calendar },
    { value: 'monthly', label: 'This Month', icon: Calendar },
    { value: 'quarterly', label: 'This Quarter', icon: Calendar },
  ] as const

  const departments = [
    { value: 'all', label: 'All Teams', icon: Users },
    { value: 'sales', label: 'Sales', icon: TrendingUp },
    { value: 'engineering', label: 'Engineering', icon: Users },
    { value: 'marketing', label: 'Marketing', icon: Users },
    { value: 'support', label: 'Support', icon: Users },
  ] as const

  const views = [
    { value: 'all', label: 'All Rankings', icon: Users },
    { value: 'near-me', label: `Near Me ${currentUserRank ? `(#${currentUserRank})` : ''}`, icon: MapPin },
    { value: 'top-10', label: 'Top 10', icon: TrendingUp },
  ] as const

  const metrics = [
    { value: 'points', label: 'Total Points' },
    { value: 'achievements', label: 'Achievements' },
    { value: 'activity', label: 'Activity Score' },
    { value: 'growth', label: 'Growth Rate' },
  ] as const

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <Card className="glass-card interactive-hover">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Quick Filters Row */}
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={filters.timeRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('timeRange', range.value)}
                disabled={isLoading}
                className="transition-all duration-200 hover:scale-105"
              >
                <range.icon className="w-3 h-3 mr-1" />
                {range.label}
              </Button>
            ))}
          </div>

          {/* Expandable Advanced Filters */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            
            {currentUserRank && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-muted-foreground"
              >
                Your Rank: <span className="font-semibold text-primary">#{currentUserRank}</span>
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Department Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Department
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {departments.map((dept) => (
                      <Button
                        key={dept.value}
                        variant={filters.department === dept.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('department', dept.value)}
                        disabled={isLoading}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        <dept.icon className="w-3 h-3 mr-1" />
                        {dept.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* View Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    View Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {views.map((view) => (
                      <Button
                        key={view.value}
                        variant={filters.view === view.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('view', view.value)}
                        disabled={isLoading || (view.value === 'near-me' && !currentUserRank)}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        <view.icon className="w-3 h-3 mr-1" />
                        {view.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Metric Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Ranking Metric
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {metrics.map((metric) => (
                      <Button
                        key={metric.value}
                        variant={filters.metric === metric.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('metric', metric.value)}
                        disabled={isLoading}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        {metric.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-2"
            >
              <div className="loading-skeleton h-4 w-32 rounded"></div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}