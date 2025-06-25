'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, Users, Star, Target } from 'lucide-react'
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters'
import { PersonalProgress } from '@/components/leaderboard/PersonalProgress'
import { NearMeView } from '@/components/leaderboard/NearMeView'
import { EnhancedLeaderboardTable } from '@/components/leaderboard/EnhancedLeaderboardTable'
import { useLeaderboardFilters } from '@/hooks/useLeaderboardFilters'

export default function EmployeeLeaderboardPage() {
  const {
    filters,
    filteredEntries,
    nearMeEntries,
    currentUserRank,
    isLoading,
    updateFilter
  } = useLeaderboardFilters()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="container mx-auto px-6 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Employee Recognition
          </h1>
          <p className="text-muted-foreground">
            Track achievements, points, and employee engagement across your organization
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button className="interactive-hover">
            <Plus className="mr-2 h-4 w-4" />
            Add Achievement
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
        variants={itemVariants}
      >
        <motion.div whileHover={{ scale: 1.02 }} className="h-full">
          <Card className="glass-card interactive-hover h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                45,231
              </motion.div>
              <p className="text-xs text-green-600">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="h-full">
          <Card className="glass-card interactive-hover h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-green-600">
                +15 new this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="h-full">
          <Card className="glass-card interactive-hover h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-green-600">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="h-full">
          <Card className="glass-card interactive-hover h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Across organization
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-6">
        <LeaderboardFilters
          filters={filters}
          onFilterChange={updateFilter}
          currentUserRank={currentUserRank}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Personal Progress (if user found) */}
        {currentUserRank && (
          <motion.div variants={itemVariants}>
            <PersonalProgress
              currentRank={currentUserRank}
              previousRank={currentUserRank + Math.floor(Math.random() * 3) - 1}
              points={1250}
              previousPoints={1180}
              goalProgress={78}
              achievements={12}
              streak={5}
              timeRange={filters.timeRange}
            />
          </motion.div>
        )}

        {/* Near Me View (when selected) */}
        {filters.view === 'near-me' && currentUserRank && (
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <NearMeView
              currentUserRank={currentUserRank}
              entries={nearMeEntries}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Main Leaderboard Table */}
        {filters.view !== 'near-me' && (
          <motion.div 
            variants={itemVariants} 
            className={currentUserRank ? "xl:col-span-2" : "xl:col-span-3"}
          >
            <EnhancedLeaderboardTable
              entries={filteredEntries}
              filters={filters}
              isLoading={isLoading}
              title="Employee Recognition Leaderboard"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
