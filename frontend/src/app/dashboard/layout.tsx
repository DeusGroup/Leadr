import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar - Fixed on desktop, hidden on mobile */}
      <div className="nav-menu fixed left-0 top-0 h-screen w-64 z-50 hidden lg:block">
        <DashboardSidebar />
      </div>
      
      {/* Main Content - With left margin on desktop only */}
      <div className="lg:ml-64">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-40">
          <DashboardHeader />
        </div>
        
        {/* Content - Normal scroll */}
        <main className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
