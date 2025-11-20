const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    console.log('Listing available Gemini models...');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List available models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing models:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

listModels();