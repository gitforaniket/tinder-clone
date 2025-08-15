const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  changePassword
} = require('../controllers/authController');
const { protect, rateLimit } = require('../middleware/auth');

// Apply rate limiting to auth routes
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Public routes
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);
router.put('/change-password', protect, changePassword);

module.exports = router;
