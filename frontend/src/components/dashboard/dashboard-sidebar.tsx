'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Award, 
  Settings, 
  BarChart3,
  Target,
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employee Recognition', href: '/employee-leaderboard', icon: Award },
  { name: 'Sales Performance', href: '/sales-leaderboard', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Team Management', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen overflow-y-auto">
      <div className="h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Leadr
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enterprise Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto py-6">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-12 px-4 transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 shadow-sm" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-400 dark:text-gray-500"
                    )} />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-3 border border-blue-200/30 dark:border-blue-700/30">
              <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                🚀 Enhanced Dashboard
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                AI-powered insights & real-time features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
