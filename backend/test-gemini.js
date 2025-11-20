const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-pro-latest',
      'models/gemini-pro',
      'models/gemini-1.0-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
Return ONLY a valid JSON object (no markdown, no extra text).

Return this format JSON:
{
  "summary": ["Test point 1", "Test point 2", "Test point 3"]
}
`;
        
        console.log('Sending test request...');
        const result = await model.generateContent(prompt);
        
        console.log('Response received');
        const resultText = result.response.text().trim();
        console.log('Raw response:', resultText.substring(0, 200));
        
        // Extract JSON using regex
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.error('No JSON found in response');
          continue;
        }
        
        const jsonData = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', jsonData);
        console.log(`✅ Gemini API test successful with model: ${modelName}!`);
        return modelName; // Return successful model name
        
      } catch (error) {
        console.log(`❌ Failed with ${modelName}: ${error.message.substring(0, 100)}`);
        continue;
      }
    }
    
    console.log('❌ All models failed');
    
  } catch (error) {
    console.error('❌ Gemini API test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGemini();