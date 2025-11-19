const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const ScoreCard = require('./models/ScoreCard');
const noveltyFn = require('./Evaluation_Functions/novelty_test');

async function retryNoveltyScoring(applicationNumber) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if scorecard exists
    const scorecard = await ScoreCard.findOne({ application_number: applicationNumber });
    if (!scorecard) {
      console.log('❌ No scorecard found for application:', applicationNumber);
      process.exit(1);
    }

    console.log('📊 Found scorecard, current novelty_score:', scorecard.novelty_score);

    // Run novelty scoring
    console.log('▶️ Running Novelty scoring for', applicationNumber);
    const noveltyRes = await noveltyFn(applicationNumber);
    console.log('✅ Novelty result:', noveltyRes);

    // Update the scorecard
    scorecard.novelty_score = {
      application_number: noveltyRes.application_number || applicationNumber,
      novelty_score: Number(noveltyRes.novelty_score) ? Number(noveltyRes.novelty_score) / 10 : 0,
      total_proposals_checked: Number(noveltyRes.total_proposals_checked) || 0,
      similar_proposals: Array.isArray(noveltyRes.similar_proposals) ? noveltyRes.similar_proposals : []
    };

    // Recalculate overall score
    const scoreVals = [];
    if (scorecard.finance_score && typeof scorecard.finance_score.financial_score === 'number') {
      scoreVals.push(scorecard.finance_score.financial_score);
    }
    if (scorecard.technical_score && typeof scorecard.technical_score.technical_score === 'number') {
      scoreVals.push(scorecard.technical_score.technical_score);
    }
    if (scorecard.relevance_score && typeof scorecard.relevance_score.relevance_score === 'number') {
      scoreVals.push(scorecard.relevance_score.relevance_score);
    }
    if (scorecard.novelty_score && typeof scorecard.novelty_score.novelty_score === 'number') {
      scoreVals.push(scorecard.novelty_score.novelty_score); // Already normalized to 0-10
    }

    scorecard.overall_score = scoreVals.length > 0 
      ? Math.round((scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length) * 10) / 10 
      : null;

    await scorecard.save();
    console.log('✅ Scorecard updated successfully');
    console.log('📊 New overall score:', scorecard.overall_score);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Get application number from command line
const appNumber = process.argv[2] || '20251119-11';
console.log('🔄 Retrying novelty scoring for application:', appNumber);
retryNoveltyScoring(appNumber);
