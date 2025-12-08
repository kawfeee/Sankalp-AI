const express = require('express');
const { signup, login, verifyOTP, verifyToken, getUserStatistics } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.get('/verify', protect, verifyToken);
router.get('/statistics', protect, getUserStatistics);

module.exports = router;
