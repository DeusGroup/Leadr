import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <div className="nav-menu">
        <DashboardSidebar />
      </div>
      
      {/* Main Content */}
      <div className="md:pl-64">
        <div className="flex flex-col min-h-screen">
          <DashboardHeader />
          <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
