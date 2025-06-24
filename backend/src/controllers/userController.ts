import { Request, Response } from 'express'
import { db } from '../config/sqliteDatabase'
import { users } from '../models/sqliteSchema'
import { eq, like, and, or } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'
import * as bcrypt from 'bcryptjs'

export const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      const { search, department, userType, page = 1, limit = 20 } = req.query
      const offset = (Number(page) - 1) * Number(limit)

      const conditions = []
      const searchConditions = []

      if (search) {
        searchConditions.push(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      }

      if (department) {
        conditions.push(eq(users.department, department as string))
      }

      if (userType) {
        conditions.push(eq(users.userType, userType as any))
      }

      // Combine search conditions with OR, other conditions with AND
      const whereConditions = []
      if (searchConditions.length > 0) {
        whereConditions.push(or(...searchConditions))
      }
      if (conditions.length > 0) {
        whereConditions.push(...conditions)
      }

      // Build query without reassignment to avoid TypeScript inference issues
      const baseQuery = db.select().from(users)
      const finalQuery = whereConditions.length > 0 
        ? baseQuery.where(and(...whereConditions))
        : baseQuery
      
      const allUsers = await finalQuery.limit(Number(limit)).offset(offset)

      // Remove password hashes from response
      const usersResponse = allUsers.map(({ passwordHash, ...user }) => user)

      return res.json(createResponse(true, 'Users retrieved successfully', {
        users: usersResponse,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: usersResponse.length
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

      const [user] = await db.select().from(users).where(eq(users.id, Number(id))).limit(1)
      if (!user) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const { passwordHash, ...userResponse } = user
      return res.json(createResponse(true, 'User retrieved successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Get user by ID error:', error)
      return res.status(500).json(createResponse(false, 'Failed to get user'))
    }
  },

  async createUser(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, password, userType, department, territory } = req.body

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (existingUser.length > 0) {
        return res.status(400).json(createResponse(false, 'User already exists'))
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        firstName,
        lastName,
        passwordHash,
        userType: userType || 'employee',
        department,
        territory,
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
      const { firstName, lastName, department, territory, userType, status } = req.body

      const [updatedUser] = await db.update(users)
        .set({
          firstName,
          lastName,
          department,
          territory,
          userType,
          status,
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

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [deletedUser] = await db.delete(users).where(eq(users.id, Number(id))).returning()
      if (!deletedUser) {
        return res.status(404).json(createResponse(false, 'User not found'))
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
  }
}
