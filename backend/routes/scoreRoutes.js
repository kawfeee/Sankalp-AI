const express = require('express');
const { getScoreCardByApplication } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/scorecard/:applicationNumber
router.get('/:applicationNumber', protect, getScoreCardByApplication);

module.exports = router;
