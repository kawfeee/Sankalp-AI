const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  startVoiceSession,
  handleVapiWebhook,
  endVoiceSession
} = require('../controllers/voiceAssistantController');

// @route   POST /api/voice/start-session
// @desc    Start a new voice session with Vapi
// @access  Protected (Evaluators only)
router.post('/start-session', auth, startVoiceSession);

// @route   POST /api/voice/end-session
// @desc    End voice session and cleanup
// @access  Protected (Evaluators only)
router.post('/end-session', auth, endVoiceSession);

// @route   POST /api/vapi-handler
// @desc    Webhook endpoint for Vapi events
// @access  Public (Vapi webhook)
router.post('/vapi-handler', handleVapiWebhook);

module.exports = router;