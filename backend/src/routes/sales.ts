import express from 'express'
import { salesController } from '../controllers/salesController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Sales performance
router.get('/performance', salesController.getSalesPerformance)
router.get('/performance/:userId', salesController.getUserSalesPerformance)

// Goals
router.get('/goals', salesController.getSalesGoals)
router.get('/goals/user/:userId', salesController.getUserSalesGoals)
router.post('/goals', requireRole(['admin', 'manager', 'sales_rep']), salesController.createSalesGoal)
router.put('/goals/:id', requireRole(['admin', 'manager', 'sales_rep']), salesController.updateSalesGoal)
router.delete('/goals/:id', requireRole(['admin', 'manager']), salesController.deleteSalesGoal)

// Analytics
router.get('/analytics', salesController.getSalesAnalytics)
router.get('/analytics/territory/:territory', salesController.getTerritorySalesAnalytics)

export default router
