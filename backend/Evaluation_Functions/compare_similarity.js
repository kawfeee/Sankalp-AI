const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

module.exports = async function compareSimilarity(currentApplicationNumber, compareApplicationNumber) {
  try {
    console.log(`🔍 Comparing ${currentApplicationNumber} with ${compareApplicationNumber}`);
    
    // Fetch both application texts
    const currentDoc = await ApplicationText.findOne({ applicationNumber: currentApplicationNumber });
    const compareDoc = await ApplicationText.findOne({ applicationNumber: compareApplicationNumber });

    if (!currentDoc) throw new Error('No extracted text found for current application: ' + currentApplicationNumber);
    if (!compareDoc) throw new Error('No extracted text found for comparison application: ' + compareApplicationNumber);

    const currentText = currentDoc.extractedText || '';
    const compareText = compareDoc.extractedText || '';

    // Use Gemini to compare the texts
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prompt = `
You are an expert R&D proposal similarity analyzer. Compare these two proposals thoroughly.

NEW PROPOSAL TEXT:
${compareText.substring(0, 4000)}

EXISTING PROPOSAL (Application: ${currentApplicationNumber}):
${currentText.substring(0, 4000)}

Analyze and return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "similarityPercentage": <number 0-100, how much overall content matches>,
  "technicalNovelty": <number 0-10, 0=exact same technique, 10=completely different technique>,
  "applicationNovelty": <number 0-10, 0=same application/domain, 10=completely different application>,
  "similarityReasons": {
    "sameIdea": <true/false - are they working on the same core idea/concept?>,
    "sameIdeaExplanation": "If sameIdea is true, explain what idea they share",
    "sameTechnique": <true/false - are they using same technical methods/algorithms?>,
    "sameTechniqueExplanation": "If sameTechnique is true, list the common techniques (e.g., CNN, LSTM, blockchain, etc.)",
    "sameApplication": <true/false - are they applied to same domain/field?>,
    "sameApplicationExplanation": "If sameApplication is true, explain the common application area",
    "sameProblem": <true/false - are they solving the same problem?>,
    "sameProblemExplanation": "If sameProblem is true, explain the common problem they address"
  },
  "matchingDetails": {
    "matchedConcepts": ["list of concepts/ideas that are similar"],
    "matchedTechniques": ["list of techniques/methods that are similar - be specific like CNN, LSTM, Random Forest, etc."],
    "matchedApplications": ["list of application areas that are similar"],
    "matchedKeywords": ["list of common keywords/terms"]
  },
  "textComparison": {
    "newProposalMatchingParts": ["exact text excerpts from new proposal that match"],
    "existingProposalMatchingParts": ["corresponding text excerpts from existing proposal"]
  },
  "overallExplanation": "2-3 sentences explaining WHY these proposals are similar or different. Be specific about idea/technique/application overlap."
}
`;


    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const resultText = result.response.text().trim();
    
    // Remove markdown code blocks if present
    let cleanedText = resultText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Parse JSON
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!jsonData) throw new Error('No valid JSON from Gemini response');

    return {
      current_application: currentApplicationNumber,
      comparison_application: compareApplicationNumber,
      similarity_percentage: jsonData.similarityPercentage || 0,
      technical_novelty: jsonData.technicalNovelty || 0,
      application_novelty: jsonData.applicationNovelty || 0,
      similarity_reasons: jsonData.similarityReasons || {},
      matching_details: jsonData.matchingDetails || {},
      text_comparison: jsonData.textComparison || {},
      overall_explanation: jsonData.overallExplanation || ''
    };
  } catch (err) {
    console.error('❌ compareSimilarity error:', err.message);
    
    if (err.message && err.message.includes('429')) {
      console.error('🚨 QUOTA EXCEEDED: Gemini API free tier limit reached');
    }
    
    throw err;
  }
};
