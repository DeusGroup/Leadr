import express from 'express'
import { userController } from '../controllers/userController'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Get users
router.get('/', userController.getUsers)
router.get('/:id', userController.getUserById)

// Admin only routes
router.post('/', requireRole(['admin']), userController.createUser)
router.put('/:id', requireRole(['admin', 'manager']), userController.updateUser)
router.delete('/:id', requireRole(['admin']), userController.deleteUser)

// User status management
router.put('/:id/status', requireRole(['admin', 'manager']), userController.updateUserStatus)

export default router
