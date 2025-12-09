const prompt = `
You are an expert R&D proposal similarity analyzer. Compare these two proposals thoroughly.

NEW PROPOSAL TEXT:
${newText.substring(0, 4000)}

EXISTING PROPOSAL (Application: ${existingAppNumber}):
${existingText.substring(0, 4000)}

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
  "overallExplanation": "2-3 sentences explaining WHY these proposals are similar or different. Be specific about idea/technique/application overlap."
}
`;