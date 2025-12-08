const ApplicationText = require('../models/ApplicationText');
const axios = require('axios');
require('dotenv').config();

module.exports = async function novelty_Score(applicationNumber) {
  try {
    const textDoc = await ApplicationText.findOne({ applicationNumber });
    if (!textDoc) throw new Error('No extracted text found for ' + applicationNumber);
    
    const extractedText = textDoc.extractedText || '';

    // Call the external Novelty API
    const response = await axios.post('http://localhost:8000/api/novelty-check', {
      application_number: applicationNumber,
      extracted_text: extractedText
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      throw new Error('No data received from Novelty API');
    }

    console.log('📥 Raw Python API Response:', JSON.stringify(response.data, null, 2));

    // Return the novelty score data with new format
    return {
      application_number: response.data.application_number || applicationNumber,
      novelty_score: Number(response.data.novelty_score) || 0,
      total_proposals_checked: Number(response.data.total_proposals_checked) || 0,
      novelty_scores: response.data.novelty_scores ? {
        originality_score: Number(response.data.novelty_scores.originality_score) || 0,
        technical_novelty_score: Number(response.data.novelty_scores.technical_novelty_score) || 0,
        application_novelty_score: Number(response.data.novelty_scores.application_novelty_score) || 0
      } : undefined,
      similar_proposals: Array.isArray(response.data.similar_proposals) 
        ? response.data.similar_proposals.map(p => ({
            application_number: p.application_number || '',
            similarity_percentage: Number(p.similarity_percentage) || 0
          }))
        : []
    };
  } catch (err) {
    console.error('novelty_Score error:', err.message);
    // Return a fallback structure if the API fails
    if (err.code === 'ECONNREFUSED') {
      console.error('⚠️  Novelty API not available at http://localhost:8000');
    }
    throw err;
  }
};
