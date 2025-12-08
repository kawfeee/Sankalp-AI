const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

module.exports = async function relevance_Score(applicationNumber) {
  try {
    const textDoc = await ApplicationText.findOne({ applicationNumber });
    if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
    const extractedText = textDoc.extractedText || '';

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const prompt = `You are an expert evaluator for R&D proposals in the coal mining industry. 

Analyze the following proposal for RELEVANCE TO COAL INDUSTRY.

PROPOSAL TEXT: ${extractedText}

Evaluate based on these criteria:
1. Direct applicability to real problems in the coal industry
2. Alignment with S&T-PRISM focus areas and Ministry of Mines priorities
3. Impact on safety, environment, or regulatory compliance
4. Improvement in mining efficiency, productivity, or cost reduction
5. Adoptability by coal PSUs such as CMPDI, CIL, SCCL, etc.

Refer to the following guidelines while evaluating:

SECTION 4.0 THRUST AREAS OF RESEARCH PROJECTS

4.1 Thrust areas for future research in the coal sector are listed on the MoC and CMPDI website.
4.2 Advanced technologies and methods for improving production and productivity in underground and opencast mining.
4.3 Improvement of safety, health, and environment.
4.4 Waste to Wealth initiatives.
4.5 Alternative uses of coal and clean coal technologies.
4.6 Coal beneficiation and utilization.
4.7 Exploration activities.
4.8 Innovation and indigenization under the Make-in-India concept.
4.9 Projects in any other area that benefit the coal industry are also permitted. Interdisciplinary, multidisciplinary, and transdisciplinary projects are encouraged.

IMPORTANT: When identifying relevant areas in the "relevant_areas" array, naturally INCLUDE the relevant section numbers (e.g., "Section 4.1", "Section 4.3") within your sentences to make the output authentic and traceable to the guidelines above.

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
    "relevance_score": <number between 0-10>,
    "industry_applicability_score": <number between 0-10>,
    "ministry_alignment_score": <number between 0-10>,
    "safety_environmental_impact_score": <number between 0-10>,
    "psu_adoptability_score": <number between 0-10>,
    "relevant_areas": ["Area 1","Area 2","Area 3"] <under 25 words each>
}`;

    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const resultText = result.response.text().trim();
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!jsonData) throw new Error('No valid JSON from relevance model');
    return jsonData;
  } catch (err) {
    console.error('❌ relevance_Score error:', err.message);
    
    // Check for quota errors
    if (err.message && err.message.includes('429')) {
      console.error('🚨 QUOTA EXCEEDED: Gemini API free tier limit reached (20 requests/day)');
      console.error('⏰ Please wait or upgrade at https://ai.google.dev/');
    } else if (err.message && err.message.includes('quota')) {
      console.error('🚨 QUOTA ERROR:', err.message);
    }
    
    // Return default values instead of throwing
    return {
      relevance_score: 0,
      industry_applicability_score: 0,
      ministry_alignment_score: 0,
      safety_environmental_impact_score: 0,
      psu_adoptability_score: 0,
      relevant_areas: ['API Error: ' + (err.message || 'Unknown error')]
    };
  }
};
