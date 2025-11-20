const express = require('express');
const router = express.Router();
const axios = require('axios');
const Application = require('../models/Application');
const ApplicationText = require('../models/ApplicationText');
const ScoreCard = require('../models/ScoreCard');

// Global object to store call context (callId -> proposalId mapping)
global.CALL_CONTEXT = global.CALL_CONTEXT || {};

// POST /start-voice-session - Start a new voice session with Vapi
router.post('/start-voice-session', async (req, res) => {
  console.log('=== Voice Assistant Route Hit ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    const { proposalId } = req.body;
    
    console.log('Starting voice session for proposal:', proposalId);
    
    // Verify proposal exists
    const proposal = await Application.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Fetch proposal data to provide context to Vapi
    const [application, applicationText, scoreCard] = await Promise.all([
      Application.findById(proposalId),
      ApplicationText.findOne({ applicationId: proposalId }),
      ScoreCard.findOne({ applicationNumber: { $exists: true } }).sort({ createdAt: -1 })
    ]);

    if (!application || !applicationText) {
      return res.status(404).json({
        success: false,
        message: 'Proposal data not found'
      });
    }

    // Store proposal context for this session
    const sessionContext = {
      applicationNumber: application.applicationNumber,
      projectTitle: application.projectTitle,
      institution: application.institutionName,
      status: application.status,
      hasScoreCard: !!scoreCard
    };

    // Start call with Vapi - using simple configuration
    // The assistant should be pre-configured in Vapi dashboard with system prompt
    const vapiResponse = await axios.post('https://api.vapi.ai/call', {
      assistantId: process.env.VAPI_ASSISTANT_ID,
      customer: {
        number: '+1234567890' // Placeholder for web-based calls
      }

    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const callId = vapiResponse.data.id;
    
    // Store mapping: callId -> proposalId (for cleanup purposes)
    global.CALL_CONTEXT[callId] = proposalId;
    
    console.log('Voice session started with Vapi AI:', { callId, proposalId });
    
    res.json({
      success: true,
      callId: callId,
      message: 'Voice session started successfully'
    });

  } catch (error) {
    console.error('Error starting voice session:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to start voice session',
      error: error.response?.data || error.message
    });
  }
});

// POST /vapi-handler - Webhook to handle Vapi events
router.post('/vapi-handler', async (req, res) => {
  try {
    const { type, call } = req.body;
    
    console.log('Received Vapi event:', { type, callId: call?.id });
    
    // Handle call end events (cleanup)
    if (type === 'end-of-call-report' && call?.id) {
      const callId = call.id;
      // Clean up call context
      delete global.CALL_CONTEXT[callId];
      console.log('Cleaned up call context for:', callId);
    }

    // Log other events for debugging
    if (type !== 'end-of-call-report') {
      console.log('Vapi event processed:', type);
    }

    res.json({ message: 'Event processed successfully' });

  } catch (error) {
    console.error('Error in Vapi handler:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing Vapi event',
      error: error.message
    });
  }
});

module.exports = router;