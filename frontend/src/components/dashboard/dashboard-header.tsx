'use client'

import { Button } from '@/components/ui/button'
import { Bell, Search, Settings, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function DashboardHeader() {
  return (
    <header className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="hidden md:block w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Enterprise Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Real-time Analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <Search className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <Settings className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
