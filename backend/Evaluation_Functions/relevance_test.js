const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

module.exports = async function relevance_Score(applicationNumber) {
  try {
    const textDoc = await ApplicationText.findOne({ applicationNumber });
    if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
    const extractedText = textDoc.extractedText || '';

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const prompt = `\nYou are an expert evaluator for R&D proposals in the coal mining industry. Analyze the following proposal for RELEVANCE TO COAL INDUSTRY.\n\nPROPOSAL TEXT:\n${extractedText}\n\nEvaluate based on these criteria:\n1. Direct applicability to real problems in the coal industry\n2. Alignment with S&T-PRISM focus areas and Ministry of Mines priorities\n3. Impact on safety, environment, or regulatory compliance\n4. Improvement in mining efficiency, productivity, or cost reduction\n5. Adoptability by coal PSUs such as CMPDI, CIL, SCCL, etc.\n\nReturn ONLY a valid JSON object (no markdown, no extra text) with this exact structure:\n{\n  "relevance_score": <number between 0-10>,\n  "industry_applicability_score": <number between 0-10>,\n  "ministry_alignment_score": <number between 0-10>,\n  "safety_environmental_impact_score": <number between 0-10>,\n  "psu_adoptability_score": <number between 0-10>\n}\n`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const resultText = result.response.text().trim();
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!jsonData) throw new Error('No valid JSON from relevance model');
    return jsonData;
  } catch (err) {
    console.error('relevance_Score error:', err.message);
    throw err;
  }
};
