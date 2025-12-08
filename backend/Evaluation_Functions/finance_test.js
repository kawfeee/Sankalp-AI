const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

    module.exports = async function finance_Score(applicationNumber) {
      try {
        const textDoc = await ApplicationText.findOne({ applicationNumber });
        if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
        const extractedText = textDoc.extractedText || '';

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const prompt = `\nYou are an expert financial evaluator for R&D proposals in the coal mining industry. Analyze the following proposal for FINANCIAL VIABILITY.\n\nPROPOSAL TEXT:\n${extractedText}\n\nEvaluate based on these criteria:\n1. Justification and correctness of the proposed budget\n2. Cost-benefit balance and expected financial impact\n3. Commercialization potential and market readiness\n4. Sustainability and funding continuity after project completion\n5. Identification and assessment of financial risks\n\nReturn ONLY a valid JSON object (no markdown, no extra text) with this exact structure:\n{\n  "financial_score": <number between 0-10>,\n  "commercialization_potential": <number between 0-10>,\n  "financial_risks": ["Risk 1","Risk 2","Risk 3"]\n}\n`;

        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const resultText = result.response.text().trim();
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!jsonData) throw new Error('No valid JSON from finance model');

        return jsonData;
      } catch (err) {
        console.error('❌ finance_Score error:', err.message);
        
        // Check for quota errors
        if (err.message && err.message.includes('429')) {
          console.error('🚨 QUOTA EXCEEDED: Gemini API free tier limit reached (20 requests/day)');
          console.error('⏰ Please wait or upgrade at https://ai.google.dev/');
        } else if (err.message && err.message.includes('quota')) {
          console.error('🚨 QUOTA ERROR:', err.message);
        }
        
        // Return default values instead of throwing to prevent complete failure
        return {
          financial_score: 0,
          commercialization_potential: 0,
          financial_risks: ['API Error: ' + (err.message || 'Unknown error')]
        };
      }
    };
