const ApplicationText = require('../models/ApplicationText');
require('dotenv').config();

    module.exports = async function finance_Score(applicationNumber) {
      try {
        const textDoc = await ApplicationText.findOne({ applicationNumber });
        if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
        const extractedText = textDoc.extractedText || '';

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const prompt = `You are an expert financial evaluator for R&D proposals in the coal mining industry. 

Analyze the following proposal for FINANCIAL VIABILITY.

PROPOSAL TEXT: ${extractedText}

Evaluate based on these criteria:
1. Justification and correctness of the proposed budget
2. Cost-benefit balance and expected financial impact
3. Commercialization potential and market readiness
4. Sustainability and funding continuity after project completion
5. Identification and assessment of financial risks

Refer to the following guidelines while evaluating:

SECTION 6.0 COST OF ITEMS ALLOWED IN PROJECT PROPOSAL

6.1 Equipment
Only project-specific equipment allowed, and only if similar equipment is not already available.

6.2 Permanent Assets
Land and buildings are normally not funded. Allowed only in special cases with full justification.

6.3 Manpower (JRF, SRF, RA)
Manpower should be provided by the agency. Project staff may be hired only if essential and only for project duration.

6.4 Additional Research Staff
If more JRFs, SRFs, or RAs are needed, full justification must be provided.

6.5 Contract Staff
Extra scientific or technical staff may be hired on contract for the duration of the project.

6.6 Seminars and Workshops
Up to Rs. 50,000 per implementing agency for seminars or workshops within India.

6.7 Consumables
Allowed with proper justification.

6.8 Contingency
Limited to 5 percent of the total revenue cost.

6.9 Travel (TA/DA)
Up to Rs. 3 lakh per institute. Higher amounts require detailed justification.

6.10 Responsibility for Staff
Hiring and payment of project staff must follow the norms of the implementing agency.

6.11 Signatures
Proposal must have signatures of the Project Leader or Coordinator on every page.

6.12 Institute Overheads
May be charged as per the rules given in Annexure I, Para 4.14.

---

SECTION 7.0 ITEMS NOT ALLOWED UNDER S&T GRANT

7.1 Land, buildings, furniture, fittings, calculators, computers, etc.
7.2 Salaries of permanent employees except special cases like CMPDI.
7.3 Honorarium to existing employees.
7.4 Foreign travel by Indian agencies.
7.5 Expenses for foreign experts beyond approved limits.
7.6 Purchase of staff car.
7.7 Hiring of peons, attendants, typists, etc.
7.8 Routine studies and routine operations.

---

IMPORTANT: When identifying financial risks in the "financial_risks" array, naturally INCLUDE the relevant section numbers (e.g., "Section 6.2", "Section 7.1") within your sentences to make the output authentic and traceable to the guidelines above.

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{  
    "financial_score": <number between 1-10>,  
    "commercialization_potential": <number between 1-10>,
    "financial_risks": ["Risk 1","Risk 2","Risk 3"] <under 25 words each>
}`;

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
