import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { metrics, users } from '../models/schema'
import { eq, and, desc } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

export const metricController = {
  async getMetrics(req: Request, res: Response) {
    try {
      const { leaderboardId, metricType, userId, page = 1, limit = 50 } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      let query = db.select({
        metric: metrics,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          department: users.department
        }
      }).from(metrics).innerJoin(users, eq(metrics.userId, users.id))

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
      const { userId, leaderboardId, metricType, value, description, source, weight } = req.body

      const [newMetric] = await db.insert(metrics).values({
        userId,
        leaderboardId,
        metricType,
        value: String(value),
        description,
        source,
        weight: weight ? String(weight) : '1.0',
        recordedAt: new Date()
      }).returning()

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
      const { value, description, weight } = req.body

      const [updatedMetric] = await db.update(metrics)
        .set({
          value: value ? String(value) : undefined,
          description,
          weight: weight ? String(weight) : undefined,
          updatedAt: new Date()
        })
        .where(eq(metrics.id, Number(id)))
        .returning()

      if (!updatedMetric) {
        return res.status(404).json(createResponse(false, 'Metric not found'))
      }

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

      const processedMetrics = metricsData.map(metric => ({
        ...metric,
        value: String(metric.value),
        weight: metric.weight ? String(metric.weight) : '1.0',
        recordedAt: new Date()
      }))

      const insertedMetrics = await db.insert(metrics).values(processedMetrics).returning()

      logger.info(`Bulk metrics added: ${insertedMetrics.length} metrics`)
      res.status(201).json(createResponse(true, 'Bulk metrics added successfully', {
        metrics: insertedMetrics,
        count: insertedMetrics.length
      }))
    } catch (error) {
      logger.error('Add bulk metrics error:', error)
      res.status(500).json(createResponse(false, 'Failed to add bulk metrics'))
    }
  }
}
