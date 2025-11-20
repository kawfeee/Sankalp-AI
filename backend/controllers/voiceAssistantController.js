const axios = require('axios');
const Application = require('../models/Application');
const ApplicationText = require('../models/ApplicationText');
const ScoreCard = require('../models/ScoreCard');

// Global store for mapping callId to proposalId
// In production, use Redis or database
global.CALL_CONTEXT = global.CALL_CONTEXT || {};

/**
 * Start a new voice session with Vapi
 * POST /api/voice/start-session
 */
const startVoiceSession = async (req, res) => {
  try {
    const { applicationNumber } = req.body;
    
    console.log('Starting voice session for application:', applicationNumber);
    
    if (!applicationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Application number is required'
      });
    }

    // Verify application exists
    const application = await Application.findOne({ applicationNumber });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Start call with Vapi
    const vapiResponse = await axios.post(
      'https://api.vapi.ai/call',
      {
        assistantId: process.env.VAPI_ASSISTANT_ID,
        customer: {
          number: '+1234567890' // Placeholder - Vapi requires this
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const callId = vapiResponse.data.id;
    
    // Store mapping: callId -> applicationNumber
    global.CALL_CONTEXT[callId] = applicationNumber;
    
    console.log(`Voice session started - CallID: ${callId}, Application: ${applicationNumber}`);

    res.json({
      success: true,
      callId,
      message: 'Voice session started successfully'
    });

  } catch (error) {
    console.error('Error starting voice session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start voice session',
      error: error.message
    });
  }
};

/**
 * Handle webhook events from Vapi
 * POST /api/vapi-handler
 */
const handleVapiWebhook = async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('Received Vapi webhook:', JSON.stringify(req.body, null, 2));

    // Only handle function calls (when user asks a question)
    if (message?.type === 'function-call' && message?.functionCall?.name === 'answerQuestion') {
      const callId = req.body.call?.id;
      const userQuestion = message.functionCall.parameters.question;
      
      console.log(`Processing question for callId: ${callId}`);
      console.log(`Question: ${userQuestion}`);
      
      if (!callId || !global.CALL_CONTEXT[callId]) {
        console.error('No application context found for callId:', callId);
        return res.json({ result: 'Session not found. Please restart the voice assistant.' });
      }

      const applicationNumber = global.CALL_CONTEXT[callId];
      
      // Fetch proposal data from MongoDB
      const [application, applicationText, scoreCard] = await Promise.all([
        Application.findOne({ applicationNumber }),
        ApplicationText.findOne({ applicationNumber }),
        ScoreCard.findOne({ applicationNumber })
      ]);

      if (!application || !applicationText) {
        return res.json({ 
          result: 'Application data not found. Please check the application number.' 
        });
      }

      // Prepare data for OpenAI
      const proposalData = {
        application: {
          projectTitle: application.projectTitle,
          institutionName: application.institutionName,
          status: application.status,
          submittedAt: application.submittedAt
        },
        extractedText: applicationText.extractedText,
        scoreCard: scoreCard || {
          message: 'No evaluation scores available yet'
        }
      };

      // Create prompt for OpenAI
      const prompt = `You are SankalpAI Evaluation Assistant for the Ministry of Coal, India.

STRICT INSTRUCTIONS:
- Answer ONLY using the provided proposal text and scorecard data below
- Be concise and factual
- If asked about scores that don't exist, say "No evaluation scores available yet"
- Focus on R&D proposal evaluation context
- Keep responses under 100 words

EVALUATOR QUESTION: ${userQuestion}

PROPOSAL DETAILS:
Title: ${proposalData.application.projectTitle}
Institution: ${proposalData.application.institutionName}
Status: ${proposalData.application.status}

SCORECARD DATA:
${JSON.stringify(proposalData.scoreCard, null, 2)}

PROPOSAL TEXT:
${proposalData.extractedText.substring(0, 3000)}...

Provide a helpful, accurate answer based only on this data:`;

      // Call OpenAI
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful R&D proposal evaluation assistant. Answer questions based only on the provided data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = openaiResponse.data.choices[0].message.content;
      
      console.log('Generated answer:', answer);

      // Return the answer to Vapi
      return res.json({
        result: answer
      });
    }

    // For other webhook events, just acknowledge
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error in Vapi webhook handler:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * End voice session and cleanup
 * POST /api/voice/end-session
 */
const endVoiceSession = async (req, res) => {
  try {
    const { callId } = req.body;
    
    if (callId && global.CALL_CONTEXT[callId]) {
      delete global.CALL_CONTEXT[callId];
      console.log(`Cleaned up voice session for callId: ${callId}`);
    }

    res.json({
      success: true,
      message: 'Voice session ended'
    });

  } catch (error) {
    console.error('Error ending voice session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end voice session'
    });
  }
};

module.exports = {
  startVoiceSession,
  handleVapiWebhook,
  endVoiceSession
};