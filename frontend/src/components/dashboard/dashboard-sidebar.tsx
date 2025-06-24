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
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <Award className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
            Leaderboard
          </span>
        </div>

        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
