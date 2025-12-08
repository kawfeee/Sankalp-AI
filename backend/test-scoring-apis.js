const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testScoringAPIs() {
  try {
    console.log('=== Testing Gemini API for Scoring Functions ===\n');
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in .env file');
      process.exit(1);
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Sample proposal text for testing
    const sampleProposal = `
Research Proposal: Advanced Methane Detection System for Coal Mines

Project Title: Development of AI-Powered Methane Sensor Network
Budget: Rs. 75 Lakhs
Duration: 24 months

Section 1: Technical Approach
We propose to develop a distributed sensor network using IoT devices and machine learning algorithms 
to detect methane gas leaks in underground coal mines. The system will use carbon nanotube-based sensors
with real-time data processing capabilities.

Section 2: Budget Breakdown
- Equipment: Rs. 30 Lakhs (Sensors, IoT devices, testing equipment)
- Manpower: Rs. 25 Lakhs (2 Research Fellows for 24 months)
- Consumables: Rs. 10 Lakhs (Chemicals, materials)
- Travel: Rs. 5 Lakhs (Site visits, conferences)
- Contingency: Rs. 3 Lakhs (5% of revenue cost)
- Overheads: Rs. 2 Lakhs

Section 3: Innovation
This project addresses critical safety concerns in coal mining by providing early warning systems
for methane accumulation. It aligns with Ministry of Coal's safety initiatives and can be adopted
by Coal India Limited and other PSUs.
`;

    // Test 1: Finance Score
    console.log('\n📊 Test 1: FINANCE SCORE API');
    console.log('─'.repeat(60));
    try {
      const financePrompt = `
You are an expert financial evaluator for R&D proposals in the coal mining industry. 

Analyze the following proposal for FINANCIAL VIABILITY.

PROPOSAL TEXT: ${sampleProposal}

Evaluate based on these criteria:
1. Justification and correctness of the proposed budget
2. Cost-benefit balance and expected financial impact
3. Commercialization potential and market readiness

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{  
    "financial_score": <number between 0-10>,  
    "commercialization_potential": <number between 0-10>,
    "financial_risks": ["Risk 1","Risk 2","Risk 3"]
}
`;

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
      console.log('Sending request to Gemini...');
      const result = await model.generateContent(financePrompt);
      const resultText = result.response.text().trim();
      
      console.log('\n📥 Raw Response (first 200 chars):');
      console.log(resultText.substring(0, 200) + '...\n');
      
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      console.log('✅ Finance Score API Working!');
      console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      
    } catch (error) {
      console.error('❌ Finance Score API Failed:', error.message);
    }

    // Test 2: Technical Score
    console.log('\n\n🔧 Test 2: TECHNICAL SCORE API');
    console.log('─'.repeat(60));
    try {
      const technicalPrompt = `
You are an expert technical evaluator for R&D proposals in the coal mining industry. 

Analyze the following proposal for TECHNICAL FEASIBILITY.

PROPOSAL TEXT: ${sampleProposal}

Evaluate based on these criteria:
1. Clarity and practicality of the technical approach
2. Availability of required resources, tools, and expertise
3. Realistic timeline and milestone structure

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{  
    "technical_score": <number between 0-10>,
    "approach_clarity_score": <number between 0-10>,
    "resource_availability_score": <number between 0-10>,
    "timeline_feasibility_score": <number between 0-10>,
    "technical_risks": ["Risk 1","Risk 2","Risk 3"]
}
`;

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
      console.log('Sending request to Gemini...');
      const result = await model.generateContent(technicalPrompt);
      const resultText = result.response.text().trim();
      
      console.log('\n📥 Raw Response (first 200 chars):');
      console.log(resultText.substring(0, 200) + '...\n');
      
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      console.log('✅ Technical Score API Working!');
      console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      
    } catch (error) {
      console.error('❌ Technical Score API Failed:', error.message);
    }

    // Test 3: Relevance Score
    console.log('\n\n🎯 Test 3: RELEVANCE SCORE API');
    console.log('─'.repeat(60));
    try {
      const relevancePrompt = `
You are an expert evaluator for R&D proposals in the coal mining industry. 

Analyze the following proposal for RELEVANCE TO COAL INDUSTRY.

PROPOSAL TEXT: ${sampleProposal}

Evaluate based on these criteria:
1. Direct applicability to real problems in the coal industry
2. Alignment with S&T-PRISM focus areas and Ministry of Mines priorities
3. Impact on safety, environment, or regulatory compliance

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
    "relevance_score": <number between 0-10>,
    "industry_applicability_score": <number between 0-10>,
    "ministry_alignment_score": <number between 0-10>,
    "safety_environmental_impact_score": <number between 0-10>,
    "psu_adoptability_score": <number between 0-10>,
    "relevant_areas": ["Area 1","Area 2","Area 3"]
}
`;

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
      console.log('Sending request to Gemini...');
      const result = await model.generateContent(relevancePrompt);
      const resultText = result.response.text().trim();
      
      console.log('\n📥 Raw Response (first 200 chars):');
      console.log(resultText.substring(0, 200) + '...\n');
      
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      console.log('✅ Relevance Score API Working!');
      console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      
    } catch (error) {
      console.error('❌ Relevance Score API Failed:', error.message);
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED!');
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testScoringAPIs();
