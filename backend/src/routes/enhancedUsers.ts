import express from 'express'
import { enhancedUserController, avatarUpload } from '../controllers/enhancedUserController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get users with enhanced filtering and metrics
router.get('/', enhancedUserController.getUsers)
router.get('/:id', enhancedUserController.getUserById)
router.get('/:id/analytics', enhancedUserController.getUserAnalytics)

// Admin only routes
router.post('/', requireRole(['admin']), enhancedUserController.createUser)
router.put('/:id', requireRole(['admin', 'manager']), enhancedUserController.updateUser)
router.delete('/:id', requireRole(['admin']), enhancedUserController.deleteUser)

// User status management
router.put('/:id/status', requireRole(['admin', 'manager']), enhancedUserController.updateUserStatus)

// Avatar upload
router.post('/:id/avatar', requireRole(['admin', 'manager']), avatarUpload.single('avatar'), enhancedUserController.updateAvatar)

export default router