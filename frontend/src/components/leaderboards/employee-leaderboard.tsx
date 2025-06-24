'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

interface Employee {
  id: number
  name: string
  email: string
  department: string
  points: number
  achievements: number
  avatar?: string
  rank: number
  pointsChange: number
}

interface EmployeeLeaderboardProps {
  showFilters?: boolean
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Sales",
    points: 2450,
    achievements: 12,
    rank: 1,
    pointsChange: 125
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@company.com",
    department: "Engineering",
    points: 2380,
    achievements: 15,
    rank: 2,
    pointsChange: 89
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Marketing",
    points: 2210,
    achievements: 8,
    rank: 3,
    pointsChange: 156
  },
  {
    id: 4,
    name: "David Thompson",
    email: "david.thompson@company.com",
    department: "Sales",
    points: 2180,
    achievements: 11,
    rank: 4,
    pointsChange: 67
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    department: "Engineering",
    points: 2150,
    achievements: 9,
    rank: 5,
    pointsChange: 92
  }
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return <span className="h-5 w-5 flex items-center justify-center text-sm font-semibold text-gray-500">#{rank}</span>
  }
}

const getRankBadgeColor = (rank: number) => {
  if (rank <= 3) return "default"
  if (rank <= 10) return "secondary"
  return "outline"
}

export function EmployeeLeaderboard({ showFilters = false }: EmployeeLeaderboardProps) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")

  const departments = Array.from(new Set(employees.map(emp => emp.department)))

  const filteredEmployees = selectedDepartment === "all" 
    ? employees 
    : employees.filter(emp => emp.department === selectedDepartment)

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedDepartment === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDepartment("all")}
          >
            All Departments
          </Button>
          {departments.map(dept => (
            <Button
              key={dept}
              variant={selectedDepartment === dept ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(dept)}
            >
              {dept}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className={`leaderboard-animation hover:shadow-md ${employee.rank <= 3 ? 'ring-2 ring-primary/20' : ''}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRankIcon(employee.rank)}
                  <Badge variant={getRankBadgeColor(employee.rank)}>
                    #{employee.rank}
                  </Badge>
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {employee.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {employee.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {employee.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {employee.achievements}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Achievements</p>
                </div>

                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+{employee.pointsChange}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No employees found for the selected department.</p>
        </div>
      )}
    </div>
  )
}
