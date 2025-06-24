import { Request, Response } from 'express'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { db } from '../config/sqliteDatabase'
import { users } from '../models/sqliteSchema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, firstName, lastName, password, userType, department } = req.body

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
        organizationId: 1 // Default to first organization for now
      }).returning()

      // Generate JWT
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, userType: newUser.userType },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      )

      // Remove password from response
      const { passwordHash: _, ...userResponse } = newUser

      logger.info(`User registered: ${email}`)
      return res.status(201).json(createResponse(true, 'User registered successfully', {
        user: userResponse,
        token
      }))
    } catch (error) {
      logger.error('Registration error:', error)
      return res.status(500).json(createResponse(false, 'Registration failed'))
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (!user) {
        return res.status(401).json(createResponse(false, 'Invalid credentials'))
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash!)
      if (!isValidPassword) {
        return res.status(401).json(createResponse(false, 'Invalid credentials'))
      }

      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id))

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
      )

      // Remove password from response
      const { passwordHash: _, ...userResponse } = user

      logger.info(`User logged in: ${email}`)
      return res.json(createResponse(true, 'Login successful', {
        user: userResponse,
        token
      }))
    } catch (error) {
      logger.error('Login error:', error)
      return res.status(500).json(createResponse(false, 'Login failed'))
    }
  },

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).userId

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
      if (!user) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      const { passwordHash: _, ...userResponse } = user
      return res.json(createResponse(true, 'User retrieved successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Get current user error:', error)
      return res.status(500).json(createResponse(false, 'Failed to get user'))
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId
      const { firstName, lastName, department, phoneNumber } = req.body

      const [updatedUser] = await db.update(users)
        .set({
          firstName,
          lastName,
          department,
          phoneNumber,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning()

      const { passwordHash: _, ...userResponse } = updatedUser
      return res.json(createResponse(true, 'Profile updated successfully', { user: userResponse }))
    } catch (error) {
      logger.error('Update profile error:', error)
      return res.status(500).json(createResponse(false, 'Failed to update profile'))
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).userId
      const { currentPassword, newPassword } = req.body

      // Get current user
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
      if (!user) {
        return res.status(404).json(createResponse(false, 'User not found'))
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash!)
      if (!isValidPassword) {
        return res.status(400).json(createResponse(false, 'Current password is incorrect'))
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10)

      // Update password
      await db.update(users)
        .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
        .where(eq(users.id, userId))

      return res.json(createResponse(true, 'Password changed successfully'))
    } catch (error) {
      logger.error('Change password error:', error)
      return res.status(500).json(createResponse(false, 'Failed to change password'))
    }
  },

  async refreshToken(req: Request, res: Response) {
    // Implementation for token refresh
    return res.status(501).json(createResponse(false, 'Not implemented'))
  },

  async logout(req: Request, res: Response) {
    // Implementation for logout (token blacklisting if needed)
    return res.json(createResponse(true, 'Logged out successfully'))
  }
}
