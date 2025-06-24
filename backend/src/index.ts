import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { connectDatabase } from './config/database'

// Routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import leaderboardRoutes from './routes/leaderboards'
import metricsRoutes from './routes/metrics'
import salesRoutes from './routes/sales'
import achievementRoutes from './routes/achievements'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leaderboards', leaderboardRoutes)
app.use('/api/metrics', metricsRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/achievements', achievementRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  socket.on('join-leaderboard', (leaderboardId) => {
    socket.join(`leaderboard-${leaderboardId}`)
    logger.info(`Client ${socket.id} joined leaderboard ${leaderboardId}`)
  })

  socket.on('leave-leaderboard', (leaderboardId) => {
    socket.leave(`leaderboard-${leaderboardId}`)
    logger.info(`Client ${socket.id} left leaderboard ${leaderboardId}`)
  })

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
async function startServer() {
  try {
    await connectDatabase()

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`Database: Connected`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

// Export io for use in other modules
export { io }
