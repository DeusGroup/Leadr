'use client'

import { Button } from '@/components/ui/button'
import { Bell, Search, Settings, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function DashboardHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Unified Leaderboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
