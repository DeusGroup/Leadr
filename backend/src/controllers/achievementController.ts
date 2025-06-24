import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { achievements, userAchievements, users } from '../models/sqliteSchema'
import { eq, and, desc } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

export const achievementController = {
  async getAchievements(req: Request, res: Response) {
    try {
      const { type, isActive } = req.query

      let query = db.select().from(achievements)
      const conditions = []

      if (type) {
        conditions.push(eq(achievements.type, type as any))
      }

      if (isActive !== undefined) {
        conditions.push(eq(achievements.isActive, isActive === 'true'))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      const allAchievements = await query.orderBy(desc(achievements.createdAt))

      res.json(createResponse(true, 'Achievements retrieved successfully', {
        achievements: allAchievements
      }))
    } catch (error) {
      logger.error('Get achievements error:', error)
      res.status(500).json(createResponse(false, 'Failed to get achievements'))
    }
  },

  async getAchievementById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [achievement] = await db.select()
        .from(achievements)
        .where(eq(achievements.id, Number(id)))
        .limit(1)

      if (!achievement) {
        return res.status(404).json(createResponse(false, 'Achievement not found'))
      }

      res.json(createResponse(true, 'Achievement retrieved successfully', {
        achievement
      }))
    } catch (error) {
      logger.error('Get achievement by ID error:', error)
      res.status(500).json(createResponse(false, 'Failed to get achievement'))
    }
  },

  async getUserAchievements(req: Request, res: Response) {
    try {
      const { userId } = req.params

      const achievements = await db.select({
        userAchievement: userAchievements,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, Number(userId)))
      .orderBy(desc(userAchievements.earnedAt))

      res.json(createResponse(true, 'User achievements retrieved successfully', {
        achievements
      }))
    } catch (error) {
      logger.error('Get user achievements error:', error)
      res.status(500).json(createResponse(false, 'Failed to get user achievements'))
    }
  },

  async createAchievement(req: Request, res: Response) {
    try {
      const { name, description, type, icon, pointsValue, criteria } = req.body

      const [newAchievement] = await db.insert(achievements).values({
        name,
        description,
        type,
        icon,
        pointsValue,
        criteria: criteria ? JSON.stringify(criteria) : null,
        organizationId: 1 // Default to first organization
      }).returning()

      logger.info(`Achievement created: ${name}`)
      res.status(201).json(createResponse(true, 'Achievement created successfully', {
        achievement: newAchievement
      }))
    } catch (error) {
      logger.error('Create achievement error:', error)
      res.status(500).json(createResponse(false, 'Failed to create achievement'))
    }
  },

  async updateAchievement(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { name, description, icon, pointsValue, criteria, isActive } = req.body

      const [updatedAchievement] = await db.update(achievements)
        .set({
          name,
          description,
          icon,
          pointsValue,
          criteria: criteria ? JSON.stringify(criteria) : undefined,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(achievements.id, Number(id)))
        .returning()

      if (!updatedAchievement) {
        return res.status(404).json(createResponse(false, 'Achievement not found'))
      }

      res.json(createResponse(true, 'Achievement updated successfully', {
        achievement: updatedAchievement
      }))
    } catch (error) {
      logger.error('Update achievement error:', error)
      res.status(500).json(createResponse(false, 'Failed to update achievement'))
    }
  },

  async deleteAchievement(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [deletedAchievement] = await db.delete(achievements)
        .where(eq(achievements.id, Number(id)))
        .returning()

      if (!deletedAchievement) {
        return res.status(404).json(createResponse(false, 'Achievement not found'))
      }

      res.json(createResponse(true, 'Achievement deleted successfully'))
    } catch (error) {
      logger.error('Delete achievement error:', error)
      res.status(500).json(createResponse(false, 'Failed to delete achievement'))
    }
  },

  async awardAchievement(req: Request, res: Response) {
    try {
      const { id, userId } = req.params

      // Check if achievement exists
      const [achievement] = await db.select()
        .from(achievements)
        .where(eq(achievements.id, Number(id)))
        .limit(1)

      if (!achievement) {
        return res.status(404).json(createResponse(false, 'Achievement not found'))
      }

      // Check if user already has this achievement
      const [existingUserAchievement] = await db.select()
        .from(userAchievements)
        .where(and(
          eq(userAchievements.userId, Number(userId)),
          eq(userAchievements.achievementId, Number(id))
        ))
        .limit(1)

      if (existingUserAchievement) {
        return res.status(400).json(createResponse(false, 'User already has this achievement'))
      }

      // Award the achievement
      const [newUserAchievement] = await db.insert(userAchievements).values({
        userId: Number(userId),
        achievementId: Number(id),
        earnedAt: new Date()
      }).returning()

      logger.info(`Achievement awarded: ${achievement.name} to user ${userId}`)
      res.status(201).json(createResponse(true, 'Achievement awarded successfully', {
        userAchievement: newUserAchievement,
        achievement
      }))
    } catch (error) {
      logger.error('Award achievement error:', error)
      res.status(500).json(createResponse(false, 'Failed to award achievement'))
    }
  },

  async removeUserAchievement(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [removedUserAchievement] = await db.delete(userAchievements)
        .where(eq(userAchievements.id, Number(id)))
        .returning()

      if (!removedUserAchievement) {
        return res.status(404).json(createResponse(false, 'User achievement not found'))
      }

      res.json(createResponse(true, 'User achievement removed successfully'))
    } catch (error) {
      logger.error('Remove user achievement error:', error)
      res.status(500).json(createResponse(false, 'Failed to remove user achievement'))
    }
  }
}
