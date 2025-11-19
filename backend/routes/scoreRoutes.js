const express = require('express');
const { getScoreCardByApplication, getAllScoreCards, updateScoreCard } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/scorecard/all/list - must be before /:applicationNumber
router.get('/all/list', protect, getAllScoreCards);

// GET /api/scorecard/:applicationNumber
router.get('/:applicationNumber', protect, getScoreCardByApplication);

// PUT /api/scorecard/:applicationNumber - Update scorecard
router.put('/:applicationNumber', protect, updateScoreCard);

module.exports = router;
