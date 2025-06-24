'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Award, TrendingUp, DollarSign, Target, Users } from 'lucide-react'

interface SalesRep {
  id: number
  name: string
  email: string
  territory: string
  boardRevenue: number
  mspRevenue: number
  voiceSeats: number
  totalDeals: number
  weightedScore: number
  rank: number
  avatar?: string
  revenueChange: number
}

interface SalesLeaderboardProps {
  showFilters?: boolean
}

const mockSalesReps: SalesRep[] = [
  {
    id: 1,
    name: "James Wilson",
    email: "james.wilson@company.com",
    territory: "West Coast",
    boardRevenue: 125000,
    mspRevenue: 89000,
    voiceSeats: 245,
    totalDeals: 18,
    weightedScore: 8.9,
    rank: 1,
    revenueChange: 15000
  },
  {
    id: 2,
    name: "Amanda Foster",
    email: "amanda.foster@company.com",
    territory: "East Coast",
    boardRevenue: 118000,
    mspRevenue: 92000,
    voiceSeats: 238,
    totalDeals: 22,
    weightedScore: 8.7,
    rank: 2,
    revenueChange: 12000
  },
  {
    id: 3,
    name: "Robert Kim",
    email: "robert.kim@company.com",
    territory: "Midwest",
    boardRevenue: 112000,
    mspRevenue: 87000,
    voiceSeats: 198,
    totalDeals: 15,
    weightedScore: 8.4,
    rank: 3,
    revenueChange: 8500
  },
  {
    id: 4,
    name: "Sarah Martinez",
    email: "sarah.martinez@company.com",
    territory: "South",
    boardRevenue: 108000,
    mspRevenue: 85000,
    voiceSeats: 189,
    totalDeals: 19,
    weightedScore: 8.2,
    rank: 4,
    revenueChange: 11200
  },
  {
    id: 5,
    name: "Kevin O'Connor",
    email: "kevin.oconnor@company.com",
    territory: "International",
    boardRevenue: 95000,
    mspRevenue: 78000,
    voiceSeats: 156,
    totalDeals: 12,
    weightedScore: 7.8,
    rank: 5,
    revenueChange: 6800
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SalesLeaderboard({ showFilters = false }: SalesLeaderboardProps) {
  const [salesReps, setSalesReps] = useState<SalesRep[]>(mockSalesReps)
  const [selectedTerritory, setSelectedTerritory] = useState<string>("all")

  const territories = Array.from(new Set(salesReps.map(rep => rep.territory)))

  const filteredReps = selectedTerritory === "all" 
    ? salesReps 
    : salesReps.filter(rep => rep.territory === selectedTerritory)

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTerritory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTerritory("all")}
          >
            All Territories
          </Button>
          {territories.map(territory => (
            <Button
              key={territory}
              variant={selectedTerritory === territory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTerritory(territory)}
            >
              {territory}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredReps.map((rep) => (
          <Card key={rep.id} className={`leaderboard-animation hover:shadow-md ${rep.rank <= 3 ? 'ring-2 ring-blue-500/20' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(rep.rank)}
                    <Badge variant={rep.rank <= 3 ? "default" : "secondary"}>
                      #{rep.rank}
                    </Badge>
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={rep.avatar} alt={rep.name} />
                    <AvatarFallback>
                      {rep.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {rep.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {rep.territory}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {rep.weightedScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatCurrency(rep.revenueChange)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(rep.boardRevenue + rep.mspRevenue)}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{rep.totalDeals}</p>
                    <p className="text-xs text-gray-500">Total Deals</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">{rep.voiceSeats}</p>
                    <p className="text-xs text-gray-500">Voice Seats</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(rep.mspRevenue)}</p>
                    <p className="text-xs text-gray-500">MSP Revenue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReps.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No sales representatives found for the selected territory.</p>
        </div>
      )}
    </div>
  )
}
