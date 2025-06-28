import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { metrics, users, leaderboards, salesGoals, userAchievements, achievements } from '../models/sqliteSchema'
import { eq, and, desc, sum, count, avg, sql, gte, lte } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'
import { io } from '../index'

export const metricController = {
  async getMetrics(req: Request, res: Response) {
    try {
      const { 
        leaderboardId, 
        metricType, 
        userId, 
        page = 1, 
        limit = 50,
        startDate,
        endDate,
        department,
        userType
      } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      let query = db.select({
        metric: metrics,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          department: users.department,
          userType: users.userType,
          avatar: users.avatar
        },
        leaderboard: {
          id: leaderboards.id,
          name: leaderboards.name,
          type: leaderboards.type
        }
      }).from(metrics)
        .innerJoin(users, eq(metrics.userId, users.id))
        .leftJoin(leaderboards, eq(metrics.leaderboardId, leaderboards.id))

      const conditions = []

      if (leaderboardId) {
        conditions.push(eq(metrics.leaderboardId, Number(leaderboardId)))
      }

      if (metricType) {
        conditions.push(eq(metrics.metricType, metricType as any))
      }

      if (userId) {
        conditions.push(eq(metrics.userId, Number(userId)))
      }

      if (department) {
        conditions.push(eq(users.department, department as string))
      }

      if (userType) {
        conditions.push(eq(users.userType, userType as any))
      }

      if (startDate) {
        conditions.push(gte(metrics.recordedAt, new Date(startDate as string)))
      }

      if (endDate) {
        conditions.push(lte(metrics.recordedAt, new Date(endDate as string)))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      const allMetrics = await query
        .orderBy(desc(metrics.recordedAt))
        .limit(Number(limit))
        .offset(offset)

      res.json(createResponse(true, 'Metrics retrieved successfully', {
        metrics: allMetrics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: allMetrics.length
        }
      }))
    } catch (error) {
      logger.error('Get metrics error:', error)
      res.status(500).json(createResponse(false, 'Failed to get metrics'))
    }
  },

  async getUserMetrics(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { metricType, leaderboardId } = req.query

      let query = db.select().from(metrics).where(eq(metrics.userId, Number(userId)))

      if (metricType) {
        query = query.where(and(eq(metrics.userId, Number(userId)), eq(metrics.metricType, metricType as any)))
      }

      if (leaderboardId) {
        query = query.where(and(eq(metrics.userId, Number(userId)), eq(metrics.leaderboardId, Number(leaderboardId))))
      }

      const userMetrics = await query.orderBy(desc(metrics.recordedAt))

      res.json(createResponse(true, 'User metrics retrieved successfully', {
        metrics: userMetrics
      }))
    } catch (error) {
      logger.error('Get user metrics error:', error)
      res.status(500).json(createResponse(false, 'Failed to get user metrics'))
    }
  },

  async getLeaderboardMetrics(req: Request, res: Response) {
    try {
      const { leaderboardId } = req.params
      const { metricType } = req.query

      let query = db.select().from(metrics).where(eq(metrics.leaderboardId, Number(leaderboardId)))

      if (metricType) {
        query = query.where(and(eq(metrics.leaderboardId, Number(leaderboardId)), eq(metrics.metricType, metricType as any)))
      }

      const leaderboardMetrics = await query.orderBy(desc(metrics.recordedAt))

      res.json(createResponse(true, 'Leaderboard metrics retrieved successfully', {
        metrics: leaderboardMetrics
      }))
    } catch (error) {
      logger.error('Get leaderboard metrics error:', error)
      res.status(500).json(createResponse(false, 'Failed to get leaderboard metrics'))
    }
  },

  async addMetric(req: Request, res: Response) {
    try {
      const { 
        userId, 
        leaderboardId, 
        metricType, 
        value, 
        description, 
        source, 
        weight = 1.0,
        category,
        details
      } = req.body

      // Validation
      if (!userId || !metricType || value === undefined) {
        return res.status(400).json(createResponse(false, 'Required fields missing'))
      }

      // Verify user exists
      const user = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1)
      if (!user.length) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const [newMetric] = await db.insert(metrics).values({
        userId: Number(userId),
        leaderboardId: leaderboardId ? Number(leaderboardId) : null,
        metricType,
        value: String(value),
        description: description || `${metricType} metric`,
        source: source || 'manual_entry',
        weight: String(weight),
        recordedAt: new Date()
      }).returning()

      // Broadcast real-time activity
      const [userInfo] = await db.select({
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar
      }).from(users).where(eq(users.id, Number(userId))).limit(1)

      if (userInfo) {
        const activity = {
          type: 'metric_added',
          message: `${userInfo.firstName} ${userInfo.lastName} just scored ${value} ${metricType} points!`,
          user: userInfo,
          metricType,
          value: Number(value),
          timestamp: new Date().toISOString()
        }
        io.emit('new-activity', activity)
      }

      // Check for achievements triggered by this metric
      await this.checkAchievements(Number(userId), metricType, Number(value))

      logger.info(`Metric added: ${metricType} - ${value} for user ${userId}`)
      res.status(201).json(createResponse(true, 'Metric added successfully', {
        metric: newMetric
      }))
    } catch (error) {
      logger.error('Add metric error:', error)
      res.status(500).json(createResponse(false, 'Failed to add metric'))
    }
  },

  async updateMetric(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { value, description, weight, source } = req.body

      const [updatedMetric] = await db.update(metrics)
        .set({
          value: value !== undefined ? String(value) : undefined,
          description,
          weight: weight !== undefined ? String(weight) : undefined,
          source,
          updatedAt: new Date()
        })
        .where(eq(metrics.id, Number(id)))
        .returning()

      if (!updatedMetric) {
        return res.status(404).json(createResponse(false, 'Metric not found'))
      }

      // Recalculate achievements for the user
      await this.updateUserAchievements(updatedMetric.userId)

      res.json(createResponse(true, 'Metric updated successfully', {
        metric: updatedMetric
      }))
    } catch (error) {
      logger.error('Update metric error:', error)
      res.status(500).json(createResponse(false, 'Failed to update metric'))
    }
  },

  async deleteMetric(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [deletedMetric] = await db.delete(metrics)
        .where(eq(metrics.id, Number(id)))
        .returning()

      if (!deletedMetric) {
        return res.status(404).json(createResponse(false, 'Metric not found'))
      }

      // Recalculate achievements for the user
      await this.updateUserAchievements(deletedMetric.userId)

      res.json(createResponse(true, 'Metric deleted successfully'))
    } catch (error) {
      logger.error('Delete metric error:', error)
      res.status(500).json(createResponse(false, 'Failed to delete metric'))
    }
  },

  async addBulkMetrics(req: Request, res: Response) {
    try {
      const { metrics: metricsData } = req.body

      if (!Array.isArray(metricsData) || metricsData.length === 0) {
        return res.status(400).json(createResponse(false, 'Invalid metrics data'))
      }

      // Process and validate each metric
      const processedMetrics = []
      const errors = []

      for (let i = 0; i < metricsData.length; i++) {
        const metric = metricsData[i]
        
        if (!metric.userId || !metric.metricType || metric.value === undefined) {
          errors.push(`Metric ${i}: Missing required fields`)
          continue
        }

        // Verify user exists
        const user = await db.select().from(users).where(eq(users.id, Number(metric.userId))).limit(1)
        if (!user.length) {
          errors.push(`Metric ${i}: User ${metric.userId} not found`)
          continue
        }

        processedMetrics.push({
          userId: Number(metric.userId),
          leaderboardId: metric.leaderboardId ? Number(metric.leaderboardId) : null,
          metricType: metric.metricType,
          value: String(metric.value),
          description: metric.description || `${metric.metricType} metric`,
          source: metric.source || 'bulk_import',
          weight: String(metric.weight || 1.0),
          recordedAt: metric.recordedAt ? new Date(metric.recordedAt) : new Date()
        })
      }

      if (errors.length > 0) {
        return res.status(400).json(createResponse(false, 'Validation errors', { errors }))
      }

      const insertedMetrics = await db.insert(metrics).values(processedMetrics).returning()

      // Check achievements for all users affected
      const userIds = [...new Set(processedMetrics.map(m => m.userId))]
      for (const userId of userIds) {
        await this.updateUserAchievements(userId)
      }

      logger.info(`Bulk metrics added: ${insertedMetrics.length} metrics`)
      res.status(201).json(createResponse(true, 'Bulk metrics added successfully', {
        metrics: insertedMetrics,
        count: insertedMetrics.length,
        errors: errors.length > 0 ? errors : undefined
      }))
    } catch (error) {
      logger.error('Add bulk metrics error:', error)
      res.status(500).json(createResponse(false, 'Failed to add bulk metrics'))
    }
  },

  async getUserMetricsSummary(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { period = '30' } = req.query // days

      const days = Number(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get metrics by type
      const metricSummary = await db
        .select({
          metricType: metrics.metricType,
          total: sum(metrics.value),
          count: count(),
          average: avg(metrics.value),
          latest: sql`MAX(${metrics.recordedAt})`
        })
        .from(metrics)
        .where(and(
          eq(metrics.userId, Number(userId)),
          gte(metrics.recordedAt, startDate)
        ))
        .groupBy(metrics.metricType)

      // Get recent metrics
      const recentMetrics = await db
        .select()
        .from(metrics)
        .where(eq(metrics.userId, Number(userId)))
        .orderBy(desc(metrics.recordedAt))
        .limit(20)

      // Get user achievements count
      const [achievementCount] = await db
        .select({ count: count() })
        .from(userAchievements)
        .where(eq(userAchievements.userId, Number(userId)))

      res.json(createResponse(true, 'User metrics summary retrieved successfully', {
        period: days,
        summary: metricSummary,
        recentMetrics,
        achievementCount: achievementCount?.count || 0
      }))
    } catch (error) {
      logger.error('Get user metrics summary error:', error)
      res.status(500).json(createResponse(false, 'Failed to get user metrics summary'))
    }
  },

  async getLeaderboardMetricsSummary(req: Request, res: Response) {
    try {
      const { leaderboardId } = req.params
      const { metricType, period = '30' } = req.query

      const days = Number(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const conditions = [
        eq(metrics.leaderboardId, Number(leaderboardId)),
        gte(metrics.recordedAt, startDate)
      ]

      if (metricType) {
        conditions.push(eq(metrics.metricType, metricType as any))
      }

      // Get top performers
      const topPerformers = await db
        .select({
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            avatar: users.avatar,
            department: users.department
          },
          totalValue: sum(metrics.value),
          metricCount: count()
        })
        .from(metrics)
        .innerJoin(users, eq(metrics.userId, users.id))
        .where(and(...conditions))
        .groupBy(users.id, users.firstName, users.lastName, users.avatar, users.department)
        .orderBy(desc(sum(metrics.value)))
        .limit(10)

      // Get metrics by type breakdown
      const metricBreakdown = await db
        .select({
          metricType: metrics.metricType,
          total: sum(metrics.value),
          count: count(),
          uniqueUsers: sql`COUNT(DISTINCT ${metrics.userId})`
        })
        .from(metrics)
        .where(and(...conditions))
        .groupBy(metrics.metricType)

      res.json(createResponse(true, 'Leaderboard metrics summary retrieved successfully', {
        leaderboardId: Number(leaderboardId),
        period: days,
        topPerformers,
        metricBreakdown
      }))
    } catch (error) {
      logger.error('Get leaderboard metrics summary error:', error)
      res.status(500).json(createResponse(false, 'Failed to get leaderboard metrics summary'))
    }
  },

  async getMetricsAnalytics(req: Request, res: Response) {
    try {
      const { 
        groupBy = 'day', // day, week, month
        metricType,
        userType,
        department,
        period = '30'
      } = req.query

      const days = Number(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      let dateFormat = 'YYYY-MM-DD'
      if (groupBy === 'week') dateFormat = 'YYYY-WW'
      if (groupBy === 'month') dateFormat = 'YYYY-MM'

      const conditions = [gte(metrics.recordedAt, startDate)]

      if (metricType) {
        conditions.push(eq(metrics.metricType, metricType as any))
      }

      if (userType) {
        conditions.push(eq(users.userType, userType as any))
      }

      if (department) {
        conditions.push(eq(users.department, department as string))
      }

      // Get metrics trends over time
      const trends = await db
        .select({
          period: sql`TO_CHAR(${metrics.recordedAt}, '${dateFormat}')`,
          total: sum(metrics.value),
          count: count(),
          uniqueUsers: sql`COUNT(DISTINCT ${metrics.userId})`
        })
        .from(metrics)
        .innerJoin(users, eq(metrics.userId, users.id))
        .where(and(...conditions))
        .groupBy(sql`TO_CHAR(${metrics.recordedAt}, '${dateFormat}')`)
        .orderBy(sql`TO_CHAR(${metrics.recordedAt}, '${dateFormat}')`)

      // Get department breakdown
      const departmentBreakdown = await db
        .select({
          department: users.department,
          total: sum(metrics.value),
          count: count(),
          userCount: sql`COUNT(DISTINCT ${metrics.userId})`
        })
        .from(metrics)
        .innerJoin(users, eq(metrics.userId, users.id))
        .where(and(...conditions))
        .groupBy(users.department)
        .orderBy(desc(sum(metrics.value)))

      res.json(createResponse(true, 'Metrics analytics retrieved successfully', {
        period: days,
        groupBy,
        trends,
        departmentBreakdown
      }))
    } catch (error) {
      logger.error('Get metrics analytics error:', error)
      res.status(500).json(createResponse(false, 'Failed to get metrics analytics'))
    }
  },

  // Achievement checking logic
  async checkAchievements(userId: number, metricType: string, value: number) {
    try {
      // Get all active achievements
      const activeAchievements = await db
        .select()
        .from(achievements)
        .where(eq(achievements.isActive, true))

      for (const achievement of activeAchievements) {
        const criteria = JSON.parse(achievement.criteria || '{}')
        
        // Simple achievement logic - this can be extended
        if (await this.evaluateAchievement(userId, achievement, criteria, metricType, value)) {
          // Check if user already has this achievement
          const existing = await db
            .select()
            .from(userAchievements)
            .where(and(
              eq(userAchievements.userId, userId),
              eq(userAchievements.achievementId, achievement.id)
            ))
            .limit(1)

          if (!existing.length) {
            await db.insert(userAchievements).values({
              userId,
              achievementId: achievement.id,
              earnedAt: new Date()
            })

            // Broadcast achievement activity
            const [userInfo] = await db.select({
              firstName: users.firstName,
              lastName: users.lastName,
              avatar: users.avatar
            }).from(users).where(eq(users.id, userId)).limit(1)

            if (userInfo) {
              const activity = {
                type: 'achievement_earned',
                message: `🏆 ${userInfo.firstName} ${userInfo.lastName} just earned the "${achievement.name}" achievement!`,
                user: userInfo,
                achievement: {
                  name: achievement.name,
                  description: achievement.description,
                  icon: achievement.icon
                },
                timestamp: new Date().toISOString()
              }
              io.emit('new-activity', activity)
            }

            logger.info(`Achievement earned: ${achievement.name} by user ${userId}`)
          }
        }
      }
    } catch (error) {
      logger.error('Check achievements error:', error)
    }
  },

  async evaluateAchievement(userId: number, achievement: any, criteria: any, metricType: string, value: number): Promise<boolean> {
    // Simple achievement evaluation - can be extended for complex rules
    if (criteria.metricType && criteria.metricType !== metricType) {
      return false
    }

    if (criteria.minValue && value < criteria.minValue) {
      return false
    }

    if (criteria.totalRequired) {
      const [total] = await db
        .select({ sum: sum(metrics.value) })
        .from(metrics)
        .where(and(
          eq(metrics.userId, userId),
          eq(metrics.metricType, metricType)
        ))

      return Number(total?.sum || 0) >= criteria.totalRequired
    }

    return true
  },

  async updateUserAchievements(userId: number) {
    try {
      // Recalculate all achievements for a user
      const userMetrics = await db
        .select()
        .from(metrics)
        .where(eq(metrics.userId, userId))

      for (const metric of userMetrics) {
        await this.checkAchievements(userId, metric.metricType, Number(metric.value))
      }
    } catch (error) {
      logger.error('Update user achievements error:', error)
    }
  }
}