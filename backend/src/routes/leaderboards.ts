import express from 'express'
import { leaderboardController } from '../controllers/leaderboardController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Public leaderboard routes
router.get('/', leaderboardController.getLeaderboards)
router.get('/:id', leaderboardController.getLeaderboardById)
router.get('/:id/rankings', leaderboardController.getLeaderboardRankings)
router.get('/:id/user/:userId', leaderboardController.getUserRanking)

// Admin routes
router.post('/', requireRole(['admin', 'manager']), leaderboardController.createLeaderboard)
router.put('/:id', requireRole(['admin', 'manager']), leaderboardController.updateLeaderboard)
router.delete('/:id', requireRole(['admin']), leaderboardController.deleteLeaderboard)

// Ranking calculation
router.post('/:id/calculate', requireRole(['admin', 'manager']), leaderboardController.calculateRankings)

export default router
