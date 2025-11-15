const express = require('express');
const { signup, login, verifyToken, getUserStatistics } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/verify', protect, verifyToken);
router.get('/statistics', protect, getUserStatistics);

module.exports = router;
