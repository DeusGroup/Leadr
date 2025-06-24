import express from 'express'
import { authController } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refreshToken)

// Protected routes
router.post('/logout', authenticateToken, authController.logout)
router.get('/me', authenticateToken, authController.getCurrentUser)
router.put('/profile', authenticateToken, authController.updateProfile)
router.put('/password', authenticateToken, authController.changePassword)

export default router
