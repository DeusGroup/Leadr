import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { users, metrics, userAchievements, achievements, salesGoals, leaderboardRankings } from '../models/sqliteSchema'
import { eq, like, and, or, desc, sum, count, sql } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const avatarUpload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'))
    }
    cb(null, true)
  }
})

export const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      const { search, department, userType, page = 1, limit = 20, includeMetrics = false } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      let query = db.select({
        id: users.id,
        organizationId: users.organizationId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        userType: users.userType,
        status: users.status,
        department: users.department,
        territory: users.territory,
        manager: users.manager,
        avatar: users.avatar,
        phoneNumber: users.phoneNumber,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }).from(users)

      const conditions = []

      if (search) {
        const searchPattern = `%${search}%`
        conditions.push(
          sql`(${users.firstName} ILIKE ${searchPattern} OR ${users.lastName} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`
        )
      }

      if (department) {
        conditions.push(eq(users.department, department as string))
      }

      if (userType) {
        conditions.push(eq(users.userType, userType as any))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      const allUsers = await query.limit(Number(limit)).offset(offset)

      // If metrics are requested, fetch additional data
      let usersWithMetrics = allUsers
      if (includeMetrics === 'true') {
        usersWithMetrics = await Promise.all(allUsers.map(async (user) => {
          // Get total metrics
          const [totalPoints] = await db
            .select({ total: sum(metrics.value) })
            .from(metrics)
            .where(and(eq(metrics.userId, user.id), eq(metrics.metricType, 'points')))

          const [totalRevenue] = await db
            .select({ total: sum(metrics.value) })
            .from(metrics)
            .where(and(eq(metrics.userId, user.id), eq(metrics.metricType, 'revenue')))

          const [achievementCount] = await db
            .select({ count: count() })
            .from(userAchievements)
            .where(eq(userAchievements.userId, user.id))

          return {
            ...user,
            metrics: {
              totalPoints: Number(totalPoints?.total || 0),
              totalRevenue: Number(totalRevenue?.total || 0),
              achievementCount: achievementCount?.count || 0
            }
          }
        }))
      }

      return res.json(createResponse(true, 'Users retrieved successfully', {
        users: usersWithMetrics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: usersWithMetrics.length
        }
      }))
    } catch (error) {
      logger.error('Get users error:', error)
      return res.status(500).json(createResponse(false, 'Failed to get users'))
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [user] = await db.select({
        id: users.id,
        organizationId: users.organizationId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        userType: users.userType,
        status: users.status,
        department: users.department,
        territory: users.territory,
        manager: users.manager,
        avatar: users.avatar,
        phoneNumber: users.phoneNumber,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }).from(users).where(eq(users.id, Number(id))).limit(1)

      if (!user) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      // Get user metrics summary
      const [pointsMetrics] = await db
        .select({ total: sum(metrics.value), count: count() })
        .from(metrics)
        .where(and(eq(metrics.userId, user.id), eq(metrics.metricType, 'points')))

      const [revenueMetrics] = await db
        .select({ total: sum(metrics.value), count: count() })
        .from(metrics)
        .where(and(eq(metrics.userId, user.id), eq(metrics.metricType, 'revenue')))

      const [dealsMetrics] = await db
        .select({ total: sum(metrics.value), count: count() })
        .from(metrics)
        .where(and(eq(metrics.userId, user.id), eq(metrics.metricType, 'deals')))

      const [userAchievementsList] = await db
        .select({ count: count() })
        .from(userAchievements)
        .where(eq(userAchievements.userId, user.id))

      const recentMetrics = await db
        .select()
        .from(metrics)
        .where(eq(metrics.userId, user.id))
        .orderBy(desc(metrics.recordedAt))
        .limit(10)

      const userWithMetrics = {
        ...user,
        metrics: {
          points: {
            total: Number(pointsMetrics?.total || 0),
            count: pointsMetrics?.count || 0
          },
          revenue: {
            total: Number(revenueMetrics?.total || 0),
            count: revenueMetrics?.count || 0
          },
          deals: {
            total: Number(dealsMetrics?.total || 0),
            count: dealsMetrics?.count || 0
          },
          achievements: userAchievementsList?.count || 0,
          recent: recentMetrics
        }
      }

      return res.json(createResponse(true, 'User retrieved successfully', { user: userWithMetrics }))
    } catch (error) {
      logger.error('Get user by ID error:', error)
      return res.status(500).json(createResponse(false, 'Failed to get user'))
    }
  },

  async createUser(req: Request, res: Response) {
    try {
      const { 
        email, 
        firstName, 
        lastName, 
        password, 
        userType = 'employee', 
        department, 
        territory, 
        manager,
        phoneNumber 
      } = req.body

      // Validation
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json(createResponse(false, 'Required fields missing'))
      }

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existingUser.length > 0) {
        return res.status(400).json(createResponse(false, 'User already exists'))
      }

      // Generate username
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '')

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        firstName,
        lastName,
        username,
        passwordHash,
        userType,
        department,
        territory,
        manager,
        phoneNumber,
        organizationId: 1 // Default to first organization
      }).returning()

      const { passwordHash: _, ...userResponse } = newUser
      logger.info(`User created: ${email}`)
      return res.status(201).json(createResponse(true, 'User created successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Create user error:', error)
      return res.status(500).json(createResponse(false, 'Failed to create user'))
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Remove sensitive fields
      const { password, passwordHash: _, email, ...safeUpdateData } = updateData

      // If password is being updated, hash it
      if (password) {
        safeUpdateData.passwordHash = await bcrypt.hash(password, 10)
      }

      const [updatedUser] = await db.update(users)
        .set({
          ...safeUpdateData,
          updatedAt: new Date()
        })
        .where(eq(users.id, Number(id)))
        .returning()

      if (!updatedUser) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const { passwordHash, ...userResponse } = updatedUser
      return res.json(createResponse(true, 'User updated successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Update user error:', error)
      return res.status(500).json(createResponse(false, 'Failed to update user'))
    }
  },

  async updateAvatar(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      if (!req.file) {
        return res.status(400).json(createResponse(false, 'No file uploaded'))
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`

      const [updatedUser] = await db.update(users)
        .set({ avatar: avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, Number(id)))
        .returning()

      if (!updatedUser) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const { passwordHash, ...userResponse } = updatedUser
      return res.json(createResponse(true, 'Avatar updated successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Update avatar error:', error)
      return res.status(500).json(createResponse(false, 'Failed to update avatar'))
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Check if user exists
      const [existingUser] = await db.select().from(users).where(eq(users.id, Number(id))).limit(1)
      if (!existingUser) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      // Delete related data first (cascade delete)
      await db.delete(userAchievements).where(eq(userAchievements.userId, Number(id)))
      await db.delete(metrics).where(eq(metrics.userId, Number(id)))
      await db.delete(salesGoals).where(eq(salesGoals.userId, Number(id)))
      await db.delete(leaderboardRankings).where(eq(leaderboardRankings.userId, Number(id)))

      // Delete user
      await db.delete(users).where(eq(users.id, Number(id)))

      // Clean up avatar file if exists
      if (existingUser.avatar) {
        const avatarPath = path.join(process.cwd(), 'uploads/avatars', path.basename(existingUser.avatar))
        try {
          fs.unlinkSync(avatarPath)
        } catch (error) {
          logger.warn('Failed to delete avatar file:', error)
        }
      }

      return res.json(createResponse(true, 'User deleted successfully'))
    } catch (error) {
      logger.error('Delete user error:', error)
      return res.status(500).json(createResponse(false, 'Failed to delete user'))
    }
  },

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json(createResponse(false, 'Invalid status'))
      }

      const [updatedUser] = await db.update(users)
        .set({ status, updatedAt: new Date() })
        .where(eq(users.id, Number(id)))
        .returning()

      if (!updatedUser) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const { passwordHash, ...userResponse } = updatedUser
      return res.json(createResponse(true, 'User status updated successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Update user status error:', error)
      return res.status(500).json(createResponse(false, 'Failed to update user status'))
    }
  },

  async getUserAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { period = '30' } = req.query // days

      const user = await db.select().from(users).where(eq(users.id, Number(id))).limit(1)
      if (!user.length) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const days = Number(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get metrics by period
      const metricsData = await db
        .select({
          metricType: metrics.metricType,
          value: metrics.value,
          recordedAt: metrics.recordedAt,
          description: metrics.description
        })
        .from(metrics)
        .where(and(
          eq(metrics.userId, Number(id)),
          sql`${metrics.recordedAt} >= ${startDate}`
        ))
        .orderBy(desc(metrics.recordedAt))

      // Group by metric type and aggregate
      const analytics = metricsData.reduce((acc, metric) => {
        const type = metric.metricType
        if (!acc[type]) {
          acc[type] = {
            total: 0,
            count: 0,
            history: []
          }
        }
        acc[type].total += Number(metric.value)
        acc[type].count += 1
        acc[type].history.push({
          value: Number(metric.value),
          date: metric.recordedAt,
          description: metric.description
        })
        return acc
      }, {} as any)

      // Get user achievements
      const userAchievementData = await db
        .select({
          achievement: achievements,
          earnedAt: userAchievements.earnedAt
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, Number(id)))
        .orderBy(desc(userAchievements.earnedAt))

      return res.json(createResponse(true, 'User analytics retrieved successfully', {
        user: user[0],
        period: days,
        analytics,
        achievements: userAchievementData
      }))
    } catch (error) {
      logger.error('Get user analytics error:', error)
      return res.status(500).json(createResponse(false, 'Failed to get user analytics'))
    }
  }
}