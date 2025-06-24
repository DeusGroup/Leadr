import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../config/database'
import { users } from '../models/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface AuthenticatedRequest extends Request {
  userId: number
  userEmail: string
  userType: string
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json(createResponse(false, 'Access token required'))
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Verify user still exists and is active
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)

    if (!user || user.status !== 'active') {
      return res.status(401).json(createResponse(false, 'Invalid or inactive user'))
    }

    // Attach user info to request
    (req as AuthenticatedRequest).userId = decoded.userId;
    (req as AuthenticatedRequest).userEmail = decoded.email;
    (req as AuthenticatedRequest).userType = decoded.userType

    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    return res.status(403).json(createResponse(false, 'Invalid token'))
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userType = (req as AuthenticatedRequest).userType

    if (!allowedRoles.includes(userType)) {
      return res.status(403).json(createResponse(false, 'Insufficient permissions'))
    }

    next()
  }
}

export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestUserId = (req as AuthenticatedRequest).userId
    const resourceUserId = Number(req.params[userIdParam])
    const userType = (req as AuthenticatedRequest).userType

    // Admins and managers can access any resource
    if (userType === 'admin' || userType === 'manager') {
      return next()
    }

    // Users can only access their own resources
    if (requestUserId !== resourceUserId) {
      return res.status(403).json(createResponse(false, 'Can only access your own resources'))
    }

    next()
  }
}
