import express from 'express'
import { achievementController } from '../controllers/achievementController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get achievements
router.get('/', achievementController.getAchievements)
router.get('/:id', achievementController.getAchievementById)
router.get('/user/:userId', achievementController.getUserAchievements)

// Admin routes
router.post('/', requireRole(['admin', 'manager']), achievementController.createAchievement)
router.put('/:id', requireRole(['admin', 'manager']), achievementController.updateAchievement)
router.delete('/:id', requireRole(['admin']), achievementController.deleteAchievement)

// Award achievements
router.post('/:id/award/:userId', requireRole(['admin', 'manager']), achievementController.awardAchievement)
router.delete('/user-achievement/:id', requireRole(['admin', 'manager']), achievementController.removeUserAchievement)

export default router
