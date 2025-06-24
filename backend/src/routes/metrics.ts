import express from 'express'
import { metricController } from '../controllers/metricController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get metrics
router.get('/', metricController.getMetrics)
router.get('/user/:userId', metricController.getUserMetrics)
router.get('/leaderboard/:leaderboardId', metricController.getLeaderboardMetrics)

// Add/update metrics
router.post('/', requireRole(['admin', 'manager', 'sales_rep']), metricController.addMetric)
router.put('/:id', requireRole(['admin', 'manager']), metricController.updateMetric)
router.delete('/:id', requireRole(['admin']), metricController.deleteMetric)

// Bulk operations
router.post('/bulk', requireRole(['admin', 'manager']), metricController.addBulkMetrics)

export default router
