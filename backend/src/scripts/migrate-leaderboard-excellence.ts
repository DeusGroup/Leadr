import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { 
  users, 
  metrics, 
  achievements as unifiedAchievements, 
  userAchievements,
  organizations 
} from '../models/schema'
import { logger } from '../utils/logger'
import { eq } from 'drizzle-orm'

// Connection to LeaderboardXcellence database
const sourceDbUrl = process.env.LEADERBOARD_EXCELLENCE_DATABASE_URL || process.env.DATABASE_URL
const targetDbUrl = process.env.DATABASE_URL

if (!sourceDbUrl || !targetDbUrl) {
  throw new Error('Database URLs not configured')
}

const sourceConnection = postgres(sourceDbUrl)
const sourceDb = drizzle(sourceConnection)

const targetConnection = postgres(targetDbUrl)
const targetDb = drizzle(targetConnection)

interface SourceEmployee {
  id: number
  name: string
  title: string
  department: string
  specialization: string
  level: string
  points: number
  monthlyPoints: number
  streak: number
  isAdmin: boolean
  imageUrl: string | null
  createdAt: Date
}

interface SourcePointsHistory {
  id: number
  employeeId: number
  points: number
  reason: string
  category: string
  details: string | null
  projectId: string | null
  awardedBy: number
  createdAt: Date
}

interface SourceAchievement {
  id: number
  name: string
  description: string
  category: string
  tier: number
  pointsRequired: number
  requirements: string
  badgeImageUrl: string
  bonusPoints: number
}

interface SourceEmployeeAchievement {
  id: number
  employeeId: number
  achievementId: number
  earnedAt: Date
}

async function migrateLeaderboardExcellence() {
  try {
    logger.info('Starting LeaderboardXcellence data migration...')
    
    // Get default organization
    const [organization] = await targetDb
      .select()
      .from(organizations)
      .where(eq(organizations.slug, 'default'))
      .limit(1)
    
    if (!organization) {
      throw new Error('Default organization not found')
    }

    // Migrate employees to users
    logger.info('Migrating employees...')
    const sourceEmployees = await sourceDb.execute(`
      SELECT id, name, title, department, specialization, level, points, 
             monthly_points, streak, is_admin, image_url, created_at
      FROM employees
      ORDER BY id
    `) as SourceEmployee[]

    const userMap = new Map<number, number>() // oldId -> newId

    for (const employee of sourceEmployees) {
      // Split name into first and last name
      const nameParts = employee.name.trim().split(' ')
      const firstName = nameParts[0] || 'Unknown'
      const lastName = nameParts.slice(1).join(' ') || 'User'
      
      // Generate email and username
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '')
      const email = `${username}@company.com`

      const [newUser] = await targetDb
        .insert(users)
        .values({
          organizationId: organization.id,
          email,
          firstName,
          lastName,
          username,
          userType: employee.isAdmin ? 'admin' : 'employee',
          department: employee.department,
          avatar: employee.imageUrl,
          createdAt: employee.createdAt,
          updatedAt: employee.createdAt
        })
        .returning({ id: users.id })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            firstName,
            lastName,
            department: employee.department,
            avatar: employee.imageUrl,
            updatedAt: new Date()
          }
        })

      userMap.set(employee.id, newUser.id)
      
      // Create initial points metric
      if (employee.points > 0) {
        await targetDb
          .insert(metrics)
          .values({
            userId: newUser.id,
            leaderboardId: 1, // Employee leaderboard
            metricType: 'points',
            value: employee.points.toString(),
            description: 'Initial points migration from LeaderboardXcellence',
            source: 'leaderboard_excellence_migration',
            recordedAt: employee.createdAt
          })
      }
    }

    logger.info(`Migrated ${sourceEmployees.length} employees`)

    // Migrate points history to metrics
    logger.info('Migrating points history...')
    const sourcePointsHistory = await sourceDb.execute(`
      SELECT id, employee_id, points, reason, category, details, 
             project_id, awarded_by, created_at
      FROM points_history
      ORDER BY created_at
    `) as SourcePointsHistory[]

    for (const history of sourcePointsHistory) {
      const newUserId = userMap.get(history.employeeId)
      if (!newUserId) {
        logger.warn(`Skipping points history ${history.id} - user not found`)
        continue
      }

      await targetDb
        .insert(metrics)
        .values({
          userId: newUserId,
          leaderboardId: 1, // Employee leaderboard
          metricType: 'points',
          value: history.points.toString(),
          description: `${history.reason}${history.details ? ` - ${history.details}` : ''}`,
          source: history.category,
          recordedAt: history.createdAt
        })
    }

    logger.info(`Migrated ${sourcePointsHistory.length} points history records`)

    // Migrate achievements
    logger.info('Migrating achievements...')
    const sourceAchievements = await sourceDb.execute(`
      SELECT id, name, description, category, tier, points_required, 
             requirements, badge_image_url, bonus_points
      FROM achievements
      ORDER BY id
    `) as SourceAchievement[]

    const achievementMap = new Map<number, number>() // oldId -> newId

    for (const achievement of sourceAchievements) {
      const [newAchievement] = await targetDb
        .insert(unifiedAchievements)
        .values({
          organizationId: organization.id,
          name: achievement.name,
          description: achievement.description,
          type: 'milestone',
          icon: achievement.badgeImageUrl,
          pointsValue: achievement.bonusPoints,
          criteria: JSON.stringify({
            tier: achievement.tier,
            pointsRequired: achievement.pointsRequired,
            requirements: achievement.requirements,
            category: achievement.category
          })
        })
        .returning({ id: unifiedAchievements.id })
        .onConflictDoNothing()

      if (newAchievement) {
        achievementMap.set(achievement.id, newAchievement.id)
      }
    }

    logger.info(`Migrated ${sourceAchievements.length} achievements`)

    // Migrate employee achievements
    logger.info('Migrating employee achievements...')
    const sourceEmployeeAchievements = await sourceDb.execute(`
      SELECT id, employee_id, achievement_id, earned_at
      FROM employee_achievements
      ORDER BY earned_at
    `) as SourceEmployeeAchievement[]

    for (const empAchievement of sourceEmployeeAchievements) {
      const newUserId = userMap.get(empAchievement.employeeId)
      const newAchievementId = achievementMap.get(empAchievement.achievementId)
      
      if (!newUserId || !newAchievementId) {
        logger.warn(`Skipping employee achievement ${empAchievement.id} - user or achievement not found`)
        continue
      }

      await targetDb
        .insert(userAchievements)
        .values({
          userId: newUserId,
          achievementId: newAchievementId,
          earnedAt: empAchievement.earnedAt
        })
        .onConflictDoNothing()
    }

    logger.info(`Migrated ${sourceEmployeeAchievements.length} employee achievements`)

    logger.info('LeaderboardXcellence migration completed successfully!')
    
  } catch (error) {
    logger.error('LeaderboardXcellence migration failed:', error)
    throw error
  } finally {
    await sourceConnection.end()
    await targetConnection.end()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateLeaderboardExcellence()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { migrateLeaderboardExcellence }