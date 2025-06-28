import express from 'express'
import { metricController } from '../controllers/metricController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get metrics with advanced filtering
router.get('/', metricController.getMetrics)
router.get('/user/:userId', metricController.getUserMetrics)
router.get('/leaderboard/:leaderboardId', metricController.getLeaderboardMetrics)

// Analytics endpoints
router.get('/analytics', metricController.getMetricsAnalytics)
router.get('/users/:userId/summary', metricController.getUserMetricsSummary)
router.get('/leaderboards/:leaderboardId/summary', metricController.getLeaderboardMetricsSummary)

// Metric management (require manager or admin)
router.post('/', requireRole(['admin', 'manager']), metricController.addMetric)
router.post('/bulk', requireRole(['admin', 'manager']), metricController.addBulkMetrics)
router.put('/:id', requireRole(['admin', 'manager']), metricController.updateMetric)
router.delete('/:id', requireRole(['admin']), metricController.deleteMetric)

export default router