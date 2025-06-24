import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { 
  users, 
  metrics, 
  salesGoals,
  organizations 
} from '../models/sqliteSchema'
import { logger } from '../utils/logger'
import { eq } from 'drizzle-orm'

// Connection to SalesLeaderboard database
const sourceDbUrl = process.env.SALES_LEADERBOARD_DATABASE_URL || process.env.DATABASE_URL
const targetDbUrl = process.env.DATABASE_URL

if (!sourceDbUrl || !targetDbUrl) {
  throw new Error('Database URLs not configured')
}

const sourceConnection = postgres(sourceDbUrl)
const sourceDb = drizzle(sourceConnection)

const targetConnection = postgres(targetDbUrl)
const targetDb = drizzle(targetConnection)

interface SourceParticipant {
  id: number
  name: string
  avatarUrl: string | null
  boardRevenue: number
  mspRevenue: number
  voiceSeats: number
  totalDeals: number
  boardRevenueGoal: number
  mspRevenueGoal: number
  voiceSeatsGoal: number
  totalDealsGoal: number
  score: number
  role: string
  department: string
  createdAt: Date
}

async function migrateSalesLeaderboard() {
  try {
    logger.info('Starting SalesLeaderboard data migration...')
    
    // Get default organization
    const [organization] = await targetDb
      .select()
      .from(organizations)
      .where(eq(organizations.slug, 'default'))
      .limit(1)
    
    if (!organization) {
      throw new Error('Default organization not found')
    }

    // Migrate participants to users
    logger.info('Migrating participants...')
    const sourceParticipants = await sourceDb.execute(`
      SELECT id, name, avatar_url, board_revenue, msp_revenue, voice_seats, 
             total_deals, board_revenue_goal, msp_revenue_goal, voice_seats_goal, 
             total_deals_goal, score, role, department, created_at
      FROM participants
      ORDER BY id
    `) as SourceParticipant[]

    const userMap = new Map<number, number>() // oldId -> newId

    for (const participant of sourceParticipants) {
      // Split name into first and last name
      const nameParts = participant.name.trim().split(' ')
      const firstName = nameParts[0] || 'Unknown'
      const lastName = nameParts.slice(1).join(' ') || 'Rep'
      
      // Generate email and username
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '')
      const email = `${username}@sales.company.com`

      const [newUser] = await targetDb
        .insert(users)
        .values({
          organizationId: organization.id,
          email,
          firstName,
          lastName,
          username: `sales_${username}`, // Prefix to avoid conflicts
          userType: 'sales_rep',
          department: participant.department || 'Sales',
          avatar: participant.avatarUrl,
          createdAt: participant.createdAt,
          updatedAt: participant.createdAt
        })
        .returning({ id: users.id })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            firstName,
            lastName,
            department: participant.department || 'Sales',
            avatar: participant.avatarUrl,
            updatedAt: new Date()
          }
        })

      userMap.set(participant.id, newUser.id)
      
      // Create metrics for each sales data point
      const salesMetrics = [
        {
          type: 'revenue' as const,
          value: participant.boardRevenue,
          description: 'Board Revenue',
          source: 'board_revenue'
        },
        {
          type: 'revenue' as const,
          value: participant.mspRevenue,
          description: 'MSP Revenue',
          source: 'msp_revenue'
        },
        {
          type: 'voice_seats' as const,
          value: participant.voiceSeats,
          description: 'Voice Seats',
          source: 'voice_seats'
        },
        {
          type: 'deals' as const,
          value: participant.totalDeals,
          description: 'Total Deals',
          source: 'total_deals'
        }
      ]

      // Insert metrics
      for (const metric of salesMetrics) {
        if (metric.value > 0) {
          await targetDb
            .insert(metrics)
            .values({
              userId: newUser.id,
              leaderboardId: 2, // Sales leaderboard
              metricType: metric.type,
              value: metric.value.toString(),
              description: `${metric.description} migration from SalesLeaderboard`,
              source: `sales_leaderboard_${metric.source}`,
              recordedAt: participant.createdAt
            })
        }
      }

      // Create sales goals
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const salesGoalTargets = [
        {
          metricType: 'revenue' as const,
          targetValue: participant.boardRevenueGoal,
          currentValue: participant.boardRevenue,
          description: 'Board Revenue Goal'
        },
        {
          metricType: 'revenue' as const,
          targetValue: participant.mspRevenueGoal,
          currentValue: participant.mspRevenue,
          description: 'MSP Revenue Goal'
        },
        {
          metricType: 'voice_seats' as const,
          targetValue: participant.voiceSeatsGoal,
          currentValue: participant.voiceSeats,
          description: 'Voice Seats Goal'
        },
        {
          metricType: 'deals' as const,
          targetValue: participant.totalDealsGoal,
          currentValue: participant.totalDeals,
          description: 'Total Deals Goal'
        }
      ]

      // Insert sales goals
      for (const goal of salesGoalTargets) {
        if (goal.targetValue > 0) {
          await targetDb
            .insert(salesGoals)
            .values({
              userId: newUser.id,
              leaderboardId: 2, // Sales leaderboard
              metricType: goal.metricType,
              targetValue: goal.targetValue.toString(),
              currentValue: goal.currentValue.toString(),
              period: 'monthly',
              startDate: startOfMonth,
              endDate: endOfMonth
            })
        }
      }
    }

    logger.info(`Migrated ${sourceParticipants.length} sales participants`)
    logger.info('SalesLeaderboard migration completed successfully!')
    
  } catch (error) {
    logger.error('SalesLeaderboard migration failed:', error)
    throw error
  } finally {
    await sourceConnection.end()
    await targetConnection.end()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateSalesLeaderboard()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { migrateSalesLeaderboard }