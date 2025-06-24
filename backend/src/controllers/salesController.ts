import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { metrics, users, salesGoals } from '../models/sqliteSchema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

export const salesController = {
  async getSalesPerformance(req: Request, res: Response) {
    try {
      const { territory, period, leaderboardId } = req.query

      let query = db.select({
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          territory: users.territory
        },
        totalRevenue: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'revenue' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalRevenue'),
        totalDeals: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'deals' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalDeals'),
        voiceSeats: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'voice_seats' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('voiceSeats'),
        weightedScore: sql<number>`SUM(CAST(${metrics.value} AS DECIMAL) * CAST(${metrics.weight} AS DECIMAL))`.as('weightedScore')
      })
      .from(metrics)
      .innerJoin(users, eq(metrics.userId, users.id))
      .where(eq(users.userType, 'sales_rep'))
      .groupBy(users.id, users.firstName, users.lastName, users.territory)
      .orderBy(desc(sql`SUM(CAST(${metrics.value} AS DECIMAL) * CAST(${metrics.weight} AS DECIMAL))`))

      if (territory) {
        query = query.where(and(eq(users.userType, 'sales_rep'), eq(users.territory, territory as string)))
      }

      if (leaderboardId) {
        query = query.where(and(eq(users.userType, 'sales_rep'), eq(metrics.leaderboardId, Number(leaderboardId))))
      }

      const performance = await query

      res.json(createResponse(true, 'Sales performance retrieved successfully', {
        performance
      }))
    } catch (error) {
      logger.error('Get sales performance error:', error)
      res.status(500).json(createResponse(false, 'Failed to get sales performance'))
    }
  },

  async getUserSalesPerformance(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { period } = req.query

      const userMetrics = await db.select({
        metricType: metrics.metricType,
        value: metrics.value,
        weight: metrics.weight,
        recordedAt: metrics.recordedAt,
        description: metrics.description
      })
      .from(metrics)
      .where(eq(metrics.userId, Number(userId)))
      .orderBy(desc(metrics.recordedAt))

      // Group metrics by type
      const groupedMetrics = userMetrics.reduce((acc, metric) => {
        const type = metric.metricType
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(metric)
        return acc
      }, {} as any)

      // Calculate totals
      const totals = {
        revenue: userMetrics
          .filter(m => m.metricType === 'revenue')
          .reduce((sum, m) => sum + Number(m.value), 0),
        deals: userMetrics
          .filter(m => m.metricType === 'deals')
          .reduce((sum, m) => sum + Number(m.value), 0),
        voiceSeats: userMetrics
          .filter(m => m.metricType === 'voice_seats')
          .reduce((sum, m) => sum + Number(m.value), 0),
        weightedScore: userMetrics
          .reduce((sum, m) => sum + (Number(m.value) * Number(m.weight)), 0)
      }

      res.json(createResponse(true, 'User sales performance retrieved successfully', {
        metrics: groupedMetrics,
        totals
      }))
    } catch (error) {
      logger.error('Get user sales performance error:', error)
      res.status(500).json(createResponse(false, 'Failed to get user sales performance'))
    }
  },

  async getSalesGoals(req: Request, res: Response) {
    try {
      const { userId, period, isActive } = req.query

      let query = db.select({
        goal: salesGoals,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          territory: users.territory
        }
      }).from(salesGoals).innerJoin(users, eq(salesGoals.userId, users.id))

      const conditions = []

      if (userId) {
        conditions.push(eq(salesGoals.userId, Number(userId)))
      }

      if (period) {
        conditions.push(eq(salesGoals.period, period as string))
      }

      if (isActive !== undefined) {
        conditions.push(eq(salesGoals.isActive, isActive === 'true'))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      const goals = await query.orderBy(desc(salesGoals.createdAt))

      res.json(createResponse(true, 'Sales goals retrieved successfully', {
        goals
      }))
    } catch (error) {
      logger.error('Get sales goals error:', error)
      res.status(500).json(createResponse(false, 'Failed to get sales goals'))
    }
  },

  async getUserSalesGoals(req: Request, res: Response) {
    try {
      const { userId } = req.params

      const userGoals = await db.select()
        .from(salesGoals)
        .where(eq(salesGoals.userId, Number(userId)))
        .orderBy(desc(salesGoals.createdAt))

      res.json(createResponse(true, 'User sales goals retrieved successfully', {
        goals: userGoals
      }))
    } catch (error) {
      logger.error('Get user sales goals error:', error)
      res.status(500).json(createResponse(false, 'Failed to get user sales goals'))
    }
  },

  async createSalesGoal(req: Request, res: Response) {
    try {
      const { userId, leaderboardId, metricType, targetValue, period, startDate, endDate } = req.body

      const [newGoal] = await db.insert(salesGoals).values({
        userId,
        leaderboardId,
        metricType,
        targetValue: String(targetValue),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currentValue: '0'
      }).returning()

      logger.info(`Sales goal created for user ${userId}: ${metricType} - ${targetValue}`)
      res.status(201).json(createResponse(true, 'Sales goal created successfully', {
        goal: newGoal
      }))
    } catch (error) {
      logger.error('Create sales goal error:', error)
      res.status(500).json(createResponse(false, 'Failed to create sales goal'))
    }
  },

  async updateSalesGoal(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { targetValue, currentValue, isActive, endDate } = req.body

      const [updatedGoal] = await db.update(salesGoals)
        .set({
          targetValue: targetValue ? String(targetValue) : undefined,
          currentValue: currentValue ? String(currentValue) : undefined,
          isActive,
          endDate: endDate ? new Date(endDate) : undefined,
          updatedAt: new Date()
        })
        .where(eq(salesGoals.id, Number(id)))
        .returning()

      if (!updatedGoal) {
        return res.status(404).json(createResponse(false, 'Sales goal not found'))
      }

      res.json(createResponse(true, 'Sales goal updated successfully', {
        goal: updatedGoal
      }))
    } catch (error) {
      logger.error('Update sales goal error:', error)
      res.status(500).json(createResponse(false, 'Failed to update sales goal'))
    }
  },

  async deleteSalesGoal(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [deletedGoal] = await db.delete(salesGoals)
        .where(eq(salesGoals.id, Number(id)))
        .returning()

      if (!deletedGoal) {
        return res.status(404).json(createResponse(false, 'Sales goal not found'))
      }

      res.json(createResponse(true, 'Sales goal deleted successfully'))
    } catch (error) {
      logger.error('Delete sales goal error:', error)
      res.status(500).json(createResponse(false, 'Failed to delete sales goal'))
    }
  },

  async getSalesAnalytics(req: Request, res: Response) {
    try {
      const analytics = await db.select({
        totalRevenue: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'revenue' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalRevenue'),
        totalDeals: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'deals' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalDeals'),
        totalVoiceSeats: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'voice_seats' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalVoiceSeats'),
        activeSalesReps: sql<number>`COUNT(DISTINCT ${users.id})`.as('activeSalesReps')
      })
      .from(metrics)
      .innerJoin(users, eq(metrics.userId, users.id))
      .where(eq(users.userType, 'sales_rep'))

      res.json(createResponse(true, 'Sales analytics retrieved successfully', {
        analytics: analytics[0]
      }))
    } catch (error) {
      logger.error('Get sales analytics error:', error)
      res.status(500).json(createResponse(false, 'Failed to get sales analytics'))
    }
  },

  async getTerritorySalesAnalytics(req: Request, res: Response) {
    try {
      const { territory } = req.params

      const territoryAnalytics = await db.select({
        territory: users.territory,
        totalRevenue: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'revenue' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalRevenue'),
        totalDeals: sql<number>`SUM(CASE WHEN ${metrics.metricType} = 'deals' THEN CAST(${metrics.value} AS DECIMAL) ELSE 0 END)`.as('totalDeals'),
        activeSalesReps: sql<number>`COUNT(DISTINCT ${users.id})`.as('activeSalesReps')
      })
      .from(metrics)
      .innerJoin(users, eq(metrics.userId, users.id))
      .where(and(eq(users.userType, 'sales_rep'), eq(users.territory, territory)))
      .groupBy(users.territory)

      res.json(createResponse(true, 'Territory sales analytics retrieved successfully', {
        analytics: territoryAnalytics[0]
      }))
    } catch (error) {
      logger.error('Get territory sales analytics error:', error)
      res.status(500).json(createResponse(false, 'Failed to get territory sales analytics'))
    }
  }
}
