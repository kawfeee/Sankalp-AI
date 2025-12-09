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
You are an expert R&D proposal similarity analyzer with the strict auditing standards described below.

INPUTS:
NEW PROPOSAL TEXT:
${compareText.substring(0, 4000)}

EXISTING PROPOSAL (Application: ${  currentApplicationNumber  } ) TEXT:
${currentText.substring(0, 4000)}

ROLE & STANDARD:
- Act as an extremely strict and unforgiving research-proposal similarity auditor.
- **If there is ANY doubt, you must NOT classify the content as similar.**
- Only report similarities that are explicit, textually aligned, and conceptually identical in a defensible way.
- Vague parallels, shared buzzwords, general themes, or high-level common topics DO NOT qualify.

ANALYSIS BEHAVIOR (use the robust analysis approach from the original brief/new prompt):
- Compare idea, technique, application, problem, and concrete text alignment across both inputs.
- Compute whatever internal similarity metrics or multi-dimensional judgments you need (overall overlap, technique overlap, application overlap), BUT DO NOT output those internal metrics unless they feed the strict inclusion rules below.

OUTPUT REQUIREMENTS (MUST FOLLOW EXACTLY — no extra fields, no commentary, no markdown):
You must return ONLY a single JSON object that exactly matches the OLD PROMPT strict schema below and nothing else.

Rules to produce entries:
- Identify up to **3 matches** in each category (originality, technical_novelty, application_novelty).
- Only include a match if it meets ALL strict criteria:
  1. The similarity is **clear, concrete, and almost undeniable**.
  2. The wording, concept, or technical substance is **strongly aligned** and defensible by direct textual support.
  3. The match yields a **similarity_percentage** >= 70 (70–89 = strong, 90–100 = nearly identical). If similarity < 70 → **do not include**.
  4. Excerpts must be **directly supported by the text** in the corresponding input.
  5. Each excerpt must be **≤150 characters** (truncate to 150 characters if necessary, but ensure it remains a contiguous meaningful excerpt).
  6. Do **not** guess, infer, or extrapolate — do not create matches from implication or assumed missing content.
  7. If there is any uncertainty about whether two excerpts match → **exclude**.

Mandatory output fields for each match:
- "your_text": excerpt from the NEW proposal (current application)
- "similar_text": excerpt from the EXISTING proposal (comparison application)
- "section": closest identifiable section name or short label (e.g., "Abstract", "Methods", "Aims")
- "similarity_percentage": realistic numeric estimate (integer 0–100). Use strict thresholds: 90–100 nearly identical; 70–89 strong; below 70 exclude.

STRUCTURE AND EXACT JSON FORMAT (return ONLY this structure — each category is an array; arrays may be empty):
{
  "originality": [
    {
      "your_text": "text from new proposal (≤150 chars)",
      "similar_text": "text from existing proposal (≤150 chars)",
      "section": "section name",
      "similarity_percentage": 90
    }
    // up to 3 objects
  ],
  "technical_novelty": [
    {
      "your_text": "text from new proposal (≤150 chars)",
      "similar_text": "text from existing proposal (≤150 chars)",
      "section": "section name",
      "similarity_percentage": 85
    }
    // up to 3 objects
  ],
  "application_novelty": [
    {
      "your_text": "text from new proposal (≤150 chars)",
      "similar_text": "text from existing proposal (≤150 chars)",
      "section": "section name",
      "similarity_percentage": 80
    }
    // up to 3 objects
  ]
}

ADDITIONAL FORMAT RULES:
- Do not include any other keys or fields (no overall similarity score, no explanations outside the objects).
- Do not include nulls; omit entries instead (use empty arrays if no valid matches).
- Do not output commentary, process logs, or explanation text — only the JSON object above.
- Ensure valid JSON (proper quoting, commas, arrays). Use integers for similarity_percentage.
- If you truncate an excerpt to meet the 150-character limit, ensure it remains a contiguous substring from the original text.

INSTRUCTIONS FOR DECISIONING:
- Prioritize exact phrasing matches for technical methods, algorithms, and concrete steps when filling technical_novelty.
- For originality, prioritize explicit claims of novelty, unique claim sentences, or identically phrased innovation statements.
- For application_novelty, prioritize identical target domains, deployment descriptions, or application scenarios with matching specific details.
- If multiple candidate excerpts qualify, choose the **three strongest** per category (by textual alignment and defensibility).

Now perform the analysis and return ONLY the single JSON object described above (no surrounding text).
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
      similarity_details: {
        originality: jsonData.originality || [],
        technical_novelty: jsonData.technical_novelty || [],
        application_novelty: jsonData.application_novelty || []
      }
    };
  } catch (err) {
    console.error('❌ compareSimilarity error:', err.message);
    
    if (err.message && err.message.includes('429')) {
      console.error('🚨 QUOTA EXCEEDED: Gemini API free tier limit reached');
    }
    
    throw err;
  }
};
