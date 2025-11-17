const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

    module.exports = async function technical_Score(applicationNumber) {
      try {
        const textDoc = await ApplicationText.findOne({ applicationNumber });
        if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
        const extractedText = textDoc.extractedText || '';

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const prompt = `\nYou are an expert technical evaluator for R&D proposals in the coal mining industry. Analyze the following proposal for TECHNICAL FEASIBILITY.\n\nPROPOSAL TEXT:\n${extractedText}\n\nEvaluate based on these criteria:\n1. Clarity and practicality of the technical approach\n2. Strength of proof-of-concept or prior validation\n3. Availability of required resources, tools, and expertise\n4. Identification of technical risks and mitigation plans\n5. Realistic timeline and milestone structure\n\nReturn ONLY a valid JSON object (no markdown, no extra text) with this exact structure:\n{\n  "technical_score": <number between 0-10>,\n  "approach_clarity_score": <number between 0-10>,\n  "resource_availability_score": <number between 0-10>,\n  "timeline_feasibility_score": <number between 0-10>,\n  "technical_risks": ["Risk 1","Risk 2","Risk 3"]\n}\n`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const resultText = result.response.text().trim();
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        if (!jsonData) throw new Error('No valid JSON from technical model');
        return jsonData;
      } catch (err) {
        console.error('technical_Score error:', err.message);
        throw err;
      }
    };
