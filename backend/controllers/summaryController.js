const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApplicationText = require('../models/ApplicationText');
const Application = require('../models/Application');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate AI Summary
// @route   POST /api/summary/generate
// @access  Private
exports.generateSummary = async (req, res) => {
  try {
    const { applicationNumber, summaryType, summaryLength } = req.body;

    console.log('=== Summary Generation Request ===');
    console.log('Application Number:', applicationNumber);
    console.log('Type:', summaryType);
    console.log('Length:', summaryLength);

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'AI service not configured. Please contact administrator.'
      });
    }

    // Fetch application details
    const application = await Application.findOne({ applicationNumber });
    
    if (!application) {
      console.error('Application not found for:', applicationNumber);
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    // Fetch extracted text from database
    const applicationText = await ApplicationText.findOne({ applicationNumber });

    if (!applicationText) {
      console.error('Application text not found for:', applicationNumber);
      return res.status(404).json({
        success: false,
        message: 'Application text not found. Please ensure the application has been processed.'
      });
    }

    const extractedText = applicationText.extractedText;
    console.log('Extracted text length:', extractedText.length);
    
    // Clean the extracted text to remove any problematic characters
    const cleanExtractedText = extractedText
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u2018-\u201F]/g, '') // Remove non-printable chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('Cleaned text length:', cleanExtractedText.length);

    // Build prompt based on summary type
    const prompt = `
You are an expert Technical content writer from Ministry of Coal. Your task is to write summaries for the given R&D Proposals.

Analyse the following proposal:

PROPOSAL TEXT:
${cleanExtractedText}

Your task is to now write a ${summaryType} summary which is ${summaryLength}.

Return ONLY a valid JSON object (no markdown, no extra text).

${summaryType === 'Descriptive Summary' 
  ? `Return this format JSON:
{
  "summary": "string"
}`
  : `Return this format JSON:
{
  "summary": ["Point 1", "Point 2", ...]
}`}
`;

    // Generate summary using Gemini
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    
    console.log('Received response from Gemini');
    const resultText = result.response.text().trim();
    console.log('Raw Gemini response:', resultText.substring(0, 200) + '...');

    // Extract JSON using regex
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('No JSON found in response');
      throw new Error("No valid JSON found in model response");
    }

    console.log('Parsing JSON response...');
    const jsonData = JSON.parse(jsonMatch[0]);
    
    // Clean the summary data
    if (jsonData.summary) {
      if (typeof jsonData.summary === 'string') {
        // Clean string summary
        jsonData.summary = jsonData.summary
          .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u2018-\u201F]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      } else if (Array.isArray(jsonData.summary)) {
        // Clean array summary
        jsonData.summary = jsonData.summary.map(point => 
          typeof point === 'string' ? point
            .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u2018-\u201F]/g, '')
            .replace(/\s+/g, ' ')
            .trim() : point
        );
      }
    }
    
    console.log('Summary generated and cleaned successfully');

    res.status(200).json({
      success: true,
      summaryType,
      summaryLength,
      applicationNumber,
      projectTitle: application.projectTitle,
      institutionName: application.institutionName,
      data: jsonData
    });

  } catch (error) {
    console.error('=== Summary Generation Error ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating summary',
      error: error.toString()
    });
  }
};
