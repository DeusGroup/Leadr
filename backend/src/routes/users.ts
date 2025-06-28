import express from 'express'
import { userController, avatarUpload } from '../controllers/userController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get users with enhanced filtering and metrics
router.get('/', userController.getUsers)
router.get('/:id', userController.getUserById)
router.get('/:id/analytics', userController.getUserAnalytics)

// Admin only routes
router.post('/', requireRole(['admin']), userController.createUser)
router.put('/:id', requireRole(['admin', 'manager']), userController.updateUser)
router.delete('/:id', requireRole(['admin']), userController.deleteUser)

// User status management
router.put('/:id/status', requireRole(['admin', 'manager']), userController.updateUserStatus)

// Avatar upload
router.post('/:id/avatar', requireRole(['admin', 'manager']), avatarUpload.single('avatar'), userController.updateAvatar)

export default router