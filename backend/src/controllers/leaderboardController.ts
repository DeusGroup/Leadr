import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { leaderboards, leaderboardRankings, users, metrics } from '../models/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

export const leaderboardController = {
  async getLeaderboards(req: Request, res: Response) {
    try {
      const { type, isActive } = req.query

      let query = db.select().from(leaderboards)
      const conditions = []

      if (type) {
        conditions.push(eq(leaderboards.type, type as any))
      }

      if (isActive !== undefined) {
        conditions.push(eq(leaderboards.isActive, isActive === 'true'))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      const allLeaderboards = await query.orderBy(desc(leaderboards.createdAt))

      res.json(createResponse(true, 'Leaderboards retrieved successfully', {
        leaderboards: allLeaderboards
      }))
    } catch (error) {
      logger.error('Get leaderboards error:', error)
      res.status(500).json(createResponse(false, 'Failed to get leaderboards'))
    }
  },

  async getLeaderboardById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [leaderboard] = await db.select()
        .from(leaderboards)
        .where(eq(leaderboards.id, Number(id)))
        .limit(1)

      if (!leaderboard) {
        return res.status(404).json(createResponse(false, 'Leaderboard not found'))
      }

      res.json(createResponse(true, 'Leaderboard retrieved successfully', {
        leaderboard
      }))
    } catch (error) {
      logger.error('Get leaderboard by ID error:', error)
      res.status(500).json(createResponse(false, 'Failed to get leaderboard'))
    }
  },

  async getLeaderboardRankings(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { limit = 20, offset = 0 } = req.query

      const rankings = await db.select({
        rank: leaderboardRankings.rank,
        score: leaderboardRankings.score,
        previousRank: leaderboardRankings.previousRank,
        rankChange: leaderboardRankings.rankChange,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          department: users.department,
          territory: users.territory,
          avatar: users.avatar
        }
      })
      .from(leaderboardRankings)
      .innerJoin(users, eq(leaderboardRankings.userId, users.id))
      .where(eq(leaderboardRankings.leaderboardId, Number(id)))
      .orderBy(leaderboardRankings.rank)
      .limit(Number(limit))
      .offset(Number(offset))

      res.json(createResponse(true, 'Rankings retrieved successfully', {
        rankings
      }))
    } catch (error) {
      logger.error('Get leaderboard rankings error:', error)
      res.status(500).json(createResponse(false, 'Failed to get rankings'))
    }
  },

  async getUserRanking(req: Request, res: Response) {
    try {
      const { id, userId } = req.params

      const [ranking] = await db.select({
        rank: leaderboardRankings.rank,
        score: leaderboardRankings.score,
        previousRank: leaderboardRankings.previousRank,
        rankChange: leaderboardRankings.rankChange,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          department: users.department,
          territory: users.territory
        }
      })
      .from(leaderboardRankings)
      .innerJoin(users, eq(leaderboardRankings.userId, users.id))
      .where(and(
        eq(leaderboardRankings.leaderboardId, Number(id)),
        eq(leaderboardRankings.userId, Number(userId))
      ))
      .limit(1)

      if (!ranking) {
        return res.status(404).json(createResponse(false, 'User ranking not found'))
      }

      res.json(createResponse(true, 'User ranking retrieved successfully', {
        ranking
      }))
    } catch (error) {
      logger.error('Get user ranking error:', error)
      res.status(500).json(createResponse(false, 'Failed to get user ranking'))
    }
  },

  async createLeaderboard(req: Request, res: Response) {
    try {
      const { name, description, type, settings, startDate, endDate } = req.body

      const [newLeaderboard] = await db.insert(leaderboards).values({
        name,
        description,
        type,
        settings: settings ? JSON.stringify(settings) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        organizationId: 1 // Default to first organization
      }).returning()

      res.status(201).json(createResponse(true, 'Leaderboard created successfully', {
        leaderboard: newLeaderboard
      }))
    } catch (error) {
      logger.error('Create leaderboard error:', error)
      res.status(500).json(createResponse(false, 'Failed to create leaderboard'))
    }
  },

  async updateLeaderboard(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { name, description, settings, isActive, startDate, endDate } = req.body

      const [updatedLeaderboard] = await db.update(leaderboards)
        .set({
          name,
          description,
          settings: settings ? JSON.stringify(settings) : undefined,
          isActive,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          updatedAt: new Date()
        })
        .where(eq(leaderboards.id, Number(id)))
        .returning()

      if (!updatedLeaderboard) {
        return res.status(404).json(createResponse(false, 'Leaderboard not found'))
      }

      res.json(createResponse(true, 'Leaderboard updated successfully', {
        leaderboard: updatedLeaderboard
      }))
    } catch (error) {
      logger.error('Update leaderboard error:', error)
      res.status(500).json(createResponse(false, 'Failed to update leaderboard'))
    }
  },

  async deleteLeaderboard(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [deletedLeaderboard] = await db.delete(leaderboards)
        .where(eq(leaderboards.id, Number(id)))
        .returning()

      if (!deletedLeaderboard) {
        return res.status(404).json(createResponse(false, 'Leaderboard not found'))
      }

      res.json(createResponse(true, 'Leaderboard deleted successfully'))
    } catch (error) {
      logger.error('Delete leaderboard error:', error)
      res.status(500).json(createResponse(false, 'Failed to delete leaderboard'))
    }
  },

  async calculateRankings(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Get leaderboard
      const [leaderboard] = await db.select()
        .from(leaderboards)
        .where(eq(leaderboards.id, Number(id)))
        .limit(1)

      if (!leaderboard) {
        return res.status(404).json(createResponse(false, 'Leaderboard not found'))
      }

      // Calculate rankings based on leaderboard type
      let rankings = []

      if (leaderboard.type === 'employee') {
        // Sum points for each user
        rankings = await db.select({
          userId: metrics.userId,
          score: sql<number>`SUM(CAST(${metrics.value} AS DECIMAL))`.as('score')
        })
        .from(metrics)
        .where(and(
          eq(metrics.leaderboardId, Number(id)),
          eq(metrics.metricType, 'points')
        ))
        .groupBy(metrics.userId)
        .orderBy(desc(sql`SUM(CAST(${metrics.value} AS DECIMAL))`))
      } else if (leaderboard.type === 'sales') {
        // Calculate weighted score for sales metrics
        rankings = await db.select({
          userId: metrics.userId,
          score: sql<number>`SUM(CAST(${metrics.value} AS DECIMAL) * CAST(${metrics.weight} AS DECIMAL))`.as('score')
        })
        .from(metrics)
        .where(eq(metrics.leaderboardId, Number(id)))
        .groupBy(metrics.userId)
        .orderBy(desc(sql`SUM(CAST(${metrics.value} AS DECIMAL) * CAST(${metrics.weight} AS DECIMAL))`))
      }

      // Update rankings table
      for (let i = 0; i < rankings.length; i++) {
        const ranking = rankings[i]
        await db.insert(leaderboardRankings).values({
          leaderboardId: Number(id),
          userId: ranking.userId,
          rank: i + 1,
          score: String(ranking.score),
          calculatedAt: new Date()
        }).onConflictDoUpdate({
          target: [leaderboardRankings.leaderboardId, leaderboardRankings.userId],
          set: {
            rank: i + 1,
            score: String(ranking.score),
            calculatedAt: new Date()
          }
        })
      }

      res.json(createResponse(true, 'Rankings calculated successfully', {
        totalRankings: rankings.length
      }))
    } catch (error) {
      logger.error('Calculate rankings error:', error)
      res.status(500).json(createResponse(false, 'Failed to calculate rankings'))
    }
  }
}
