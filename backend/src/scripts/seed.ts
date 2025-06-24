import { db } from '../config/database'
import { 
  organizations, 
  users, 
  leaderboards, 
  metrics, 
  achievements, 
  userAchievements,
  salesGoals 
} from '../models/schema'
import { logger } from '../utils/logger'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...')

    // Create sample organization
    const [org] = await db.insert(organizations).values({
      name: 'Deus Group',
      slug: 'deus-group',
      description: 'Leading technology and services company',
      settings: JSON.stringify({
        currency: 'USD',
        timezone: 'America/New_York',
        features: ['employee_recognition', 'sales_tracking']
      })
    }).returning()

    logger.info(`Created organization: ${org.name}`)

    // Create sample users
    const passwordHash = await bcrypt.hash('password123', 10)

    const sampleUsers = [
      {
        organizationId: org.id,
        email: 'admin@deusgroup.com',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        passwordHash,
        userType: 'admin' as const,
        department: 'IT'
      },
      {
        organizationId: org.id,
        email: 'sarah.johnson@deusgroup.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: 'sjohnson',
        passwordHash,
        userType: 'sales_rep' as const,
        department: 'Sales',
        territory: 'West Coast'
      },
      {
        organizationId: org.id,
        email: 'michael.chen@deusgroup.com',
        firstName: 'Michael',
        lastName: 'Chen',
        username: 'mchen',
        passwordHash,
        userType: 'employee' as const,
        department: 'Engineering'
      },
      {
        organizationId: org.id,
        email: 'emily.rodriguez@deusgroup.com',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        username: 'erodriguez',
        passwordHash,
        userType: 'employee' as const,
        department: 'Marketing'
      },
      {
        organizationId: org.id,
        email: 'james.wilson@deusgroup.com',
        firstName: 'James',
        lastName: 'Wilson',
        username: 'jwilson',
        passwordHash,
        userType: 'sales_rep' as const,
        department: 'Sales',
        territory: 'East Coast'
      }
    ]

    const insertedUsers = await db.insert(users).values(sampleUsers).returning()
    logger.info(`Created ${insertedUsers.length} users`)

    // Create sample leaderboards
    const sampleLeaderboards = [
      {
        organizationId: org.id,
        name: 'Employee Recognition Board',
        description: 'Track employee achievements and points',
        type: 'employee' as const,
        settings: JSON.stringify({
          scoring: 'points',
          updateFrequency: 'real-time',
          displayCount: 20
        })
      },
      {
        organizationId: org.id,
        name: 'Sales Performance Board',
        description: 'Track sales metrics and revenue',
        type: 'sales' as const,
        settings: JSON.stringify({
          scoring: 'weighted',
          weights: {
            board_revenue: 0.4,
            msp_revenue: 0.3,
            voice_seats: 0.2,
            deals: 0.1
          },
          updateFrequency: 'daily',
          displayCount: 15
        })
      },
      {
        organizationId: org.id,
        name: 'Monthly Mixed Board',
        description: 'Combined employee and sales performance',
        type: 'mixed' as const,
        settings: JSON.stringify({
          scoring: 'hybrid',
          updateFrequency: 'hourly',
          displayCount: 25
        })
      }
    ]

    const insertedLeaderboards = await db.insert(leaderboards).values(sampleLeaderboards).returning()
    logger.info(`Created ${insertedLeaderboards.length} leaderboards`)

    // Create sample achievements
    const sampleAchievements = [
      {
        organizationId: org.id,
        name: 'Employee of the Month',
        description: 'Awarded to top performing employee monthly',
        type: 'recognition' as const,
        icon: 'trophy',
        pointsValue: 500,
        criteria: JSON.stringify({
          type: 'monthly_top',
          rank: 1,
          category: 'employee'
        })
      },
      {
        organizationId: org.id,
        name: '1000 Points Milestone',
        description: 'Reach 1000 total points',
        type: 'milestone' as const,
        icon: 'star',
        pointsValue: 100,
        criteria: JSON.stringify({
          type: 'points_total',
          threshold: 1000
        })
      },
      {
        organizationId: org.id,
        name: 'Sales Champion',
        description: 'Top sales performer of the quarter',
        type: 'recognition' as const,
        icon: 'crown',
        pointsValue: 750,
        criteria: JSON.stringify({
          type: 'quarterly_top',
          rank: 1,
          category: 'sales'
        })
      }
    ]

    const insertedAchievements = await db.insert(achievements).values(sampleAchievements).returning()
    logger.info(`Created ${insertedAchievements.length} achievements`)

    // Create sample metrics
    const employeeBoard = insertedLeaderboards.find(lb => lb.type === 'employee')
    const salesBoard = insertedLeaderboards.find(lb => lb.type === 'sales')

    if (employeeBoard && salesBoard) {
      const sampleMetrics = []

      // Employee metrics
      for (const user of insertedUsers.filter(u => u.userType === 'employee')) {
        sampleMetrics.push({
          userId: user.id,
          leaderboardId: employeeBoard.id,
          metricType: 'points' as const,
          value: String(Math.floor(Math.random() * 2000) + 500),
          description: 'Achievement points',
          source: 'system'
        })
      }

      // Sales metrics
      for (const user of insertedUsers.filter(u => u.userType === 'sales_rep')) {
        // Board revenue
        sampleMetrics.push({
          userId: user.id,
          leaderboardId: salesBoard.id,
          metricType: 'revenue' as const,
          value: String(Math.floor(Math.random() * 100000) + 50000),
          description: 'Board revenue',
          source: 'sales_system',
          weight: '0.4'
        })

        // MSP revenue
        sampleMetrics.push({
          userId: user.id,
          leaderboardId: salesBoard.id,
          metricType: 'revenue' as const,
          value: String(Math.floor(Math.random() * 80000) + 30000),
          description: 'MSP revenue',
          source: 'sales_system',
          weight: '0.3'
        })

        // Voice seats
        sampleMetrics.push({
          userId: user.id,
          leaderboardId: salesBoard.id,
          metricType: 'voice_seats' as const,
          value: String(Math.floor(Math.random() * 200) + 100),
          description: 'Voice seats sold',
          source: 'sales_system',
          weight: '0.2'
        })

        // Total deals
        sampleMetrics.push({
          userId: user.id,
          leaderboardId: salesBoard.id,
          metricType: 'deals' as const,
          value: String(Math.floor(Math.random() * 20) + 5),
          description: 'Total deals closed',
          source: 'sales_system',
          weight: '0.1'
        })
      }

      await db.insert(metrics).values(sampleMetrics)
      logger.info(`Created ${sampleMetrics.length} sample metrics`)
    }

    logger.info('Database seeding completed successfully')
    process.exit(0)
  } catch (error) {
    logger.error('Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
