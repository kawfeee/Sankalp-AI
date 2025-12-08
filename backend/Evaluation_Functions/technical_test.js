const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

    module.exports = async function technical_Score(applicationNumber) {
      try {
        const textDoc = await ApplicationText.findOne({ applicationNumber });
        if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
        const extractedText = textDoc.extractedText || '';

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const prompt = `You are an expert technical evaluator for R&D proposals in the coal mining industry. 

Analyze the following proposal for TECHNICAL FEASIBILITY.

PROPOSAL TEXT: ${extractedText}

Evaluate based on these criteria:

1. Clarity and practicality of the technical approach
2. Strength of proof-of-concept or prior validation
3. Availability of required resources, tools, and expertise
4. Identification of technical risks and mitigation plans
5. Realistic timeline and milestone structure

Refer to the following guidelines while evaluating:

SECTION 10.0 EVALUATION OF S&T PROJECT PROPOSAL

10.1 The project should fall within the thrust areas of MoC.

10.2 The past track record and expertise of the agency for conducting the research should be examined.

10.3 The proposal should show progressive R&D input compared to earlier projects and similar work done in India or abroad.

10.4 The objectives should be clear and well defined.

10.5 The work programme should have detailed activities with a proper time frame.

10.6 The time frame for purchase of equipment and recruitment of manpower should be realistic.

10.7 Cost provisions should be clear and justified.

10.8 The proposal should state the benefits expected for the industry from the research work.

IMPORTANT/MANDATORY !!! : When identifying technical risks in the "technical_risks" array, naturally INCLUDE the relevant section numbers (e.g., "Section 10.2", "Section 10.1") within your sentences to make the output authentic and traceable to the guidelines above.

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{  
    "technical_score": <number between 1-10>,
    "approach_clarity_score": <number between 1-10>,
    "resource_availability_score": <number between 1-10>,
    "timeline_feasibility_score": <number between 1-10>,
    "technical_risks": ["Risk 1","Risk 2","Risk 3"] <under 25 words each>
}`;

        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const resultText = result.response.text().trim();
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!jsonData) throw new Error('No valid JSON from technical model');
        return jsonData;
      } catch (err) {
        console.error('❌ technical_Score error:', err.message);
        
        // Check for quota errors
        if (err.message && err.message.includes('429')) {
          console.error('🚨 QUOTA EXCEEDED: Gemini API free tier limit reached (20 requests/day)');
          console.error('⏰ Please wait or upgrade at https://ai.google.dev/');
        } else if (err.message && err.message.includes('quota')) {
          console.error('🚨 QUOTA ERROR:', err.message);
        }
        
        // Return default values instead of throwing
        return {
          technical_score: 0,
          approach_clarity_score: 0,
          resource_availability_score: 0,
          timeline_feasibility_score: 0,
          technical_risks: ['API Error: ' + (err.message || 'Unknown error')]
        };
      }
    };
