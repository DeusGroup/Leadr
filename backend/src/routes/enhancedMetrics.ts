import express from 'express'
import { enhancedMetricController } from '../controllers/enhancedMetricController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get metrics with advanced filtering
router.get('/', enhancedMetricController.getMetrics)

// Analytics endpoints
router.get('/analytics', enhancedMetricController.getMetricsAnalytics)
router.get('/users/:userId/summary', enhancedMetricController.getUserMetricsSummary)
router.get('/leaderboards/:leaderboardId/summary', enhancedMetricController.getLeaderboardMetricsSummary)

// Metric management (require manager or admin)
router.post('/', requireRole(['admin', 'manager']), enhancedMetricController.addMetric)
router.post('/bulk', requireRole(['admin', 'manager']), enhancedMetricController.addBulkMetrics)
router.put('/:id', requireRole(['admin', 'manager']), enhancedMetricController.updateMetric)
router.delete('/:id', requireRole(['admin']), enhancedMetricController.deleteMetric)

export default router