import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { createResponse } from '../utils/response'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  })

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  const message = isDevelopment ? error.message : 'Internal server error'

  res.status(500).json(createResponse(false, message, isDevelopment ? {
    stack: error.stack
  } : undefined))
}
