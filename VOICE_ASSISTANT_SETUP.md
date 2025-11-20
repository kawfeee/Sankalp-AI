# Voice Assistant Setup Instructions

## Required Environment Variables

Add these to your `.env` file:

```env
# Vapi Voice Assistant Configuration
VAPI_API_KEY=4fd226b5-770c-4843-8d6f-165fa39f71c6
VAPI_ASSISTANT_ID=45cca787-5a73-4423-80b1-e94908368397
```

## Vapi Assistant Configuration

1. **Go to https://vapi.ai and login**
2. **Find your existing assistant (ID: 45cca787-5a73-4423-80b1-e94908368397)**
3. **Set the Server URL in assistant configuration:**
   
   For development (using ngrok):
   ```
   https://your-ngrok-url.ngrok.io/api/vapi-handler
   ```
   
   For production:
   ```
   https://your-domain.com/api/vapi-handler
   ```

## Development Setup with Ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your backend: `npm run dev` (port 5000)
3. In another terminal: `ngrok http 5000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update your Vapi assistant server URL to: `https://abc123.ngrok.io/api/vapi-handler`

## How It Works

1. **Evaluator clicks "Start Voice Assistant"** on ScoreCard page
2. **Frontend calls** `POST /api/voice-assistant/start-voice-session`
3. **Backend starts Vapi call** with proposal context embedded in system message
4. **Evaluator speaks** questions like:
   - "Why does this proposal have 8/10 marks in Finance?"
   - "Should I accept or reject this proposal?"
   - "Summarize the weaknesses of this proposal."
5. **Vapi's built-in AI** processes the speech and generates contextual responses
6. **AI uses only proposal data** provided in the system message
7. **Vapi converts response to speech** and plays to evaluator

## Key Benefits

- ✅ **Cost Effective**: Uses Vapi's included AI capabilities, no external AI API costs
- ✅ **Simplified Setup**: No OpenAI API key required
- ✅ **Better Performance**: Direct integration with Vapi's optimized voice AI
- ✅ **No Hallucination**: AI only uses provided proposal data
- ✅ **Real-time Processing**: Immediate voice responses during evaluation

## Features

- ✅ Only accessible to evaluators
- ✅ Uses real proposal text and scorecard data
- ✅ Visual status indicator when active
- ✅ Session management and cleanup
- ✅ Error handling and user feedback

## Testing

1. Set up ngrok as described above
2. Update Vapi assistant server URL
3. Go to any proposal's ScoreCard page as an evaluator
4. Click "Start Voice Assistant"
5. Speak your questions about the proposal