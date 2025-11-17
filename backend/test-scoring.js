require('dotenv').config();
const mongoose = require('mongoose');
const ApplicationText = require('./models/ApplicationText');
const ScoreCard = require('./models/ScoreCard');
const financeFn = require('./Evaluation_Functions/finance_test');
const technicalFn = require('./Evaluation_Functions/technical_test');
const relevanceFn = require('./Evaluation_Functions/relevance_test');

async function testScoring() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the first applicationText document
    const textDoc = await ApplicationText.findOne().sort({ createdAt: -1 });
    if (!textDoc) {
      console.log('❌ No ApplicationText documents found');
      process.exit(1);
    }

    console.log('📄 Testing with application:', textDoc.applicationNumber);
    console.log('📝 Extracted text length:', textDoc.extractedText.length, 'characters');

    // Check if scorecard exists
    const existing = await ScoreCard.findOne({ application_number: textDoc.applicationNumber });
    if (existing) {
      console.log('⚠️  ScoreCard already exists, deleting for fresh test...');
      await ScoreCard.deleteOne({ application_number: textDoc.applicationNumber });
    }

    // Test Finance scoring
    console.log('\n▶️  Running Finance scoring...');
    const financeRes = await financeFn(textDoc.applicationNumber);
    console.log('✅ Finance result:', JSON.stringify(financeRes, null, 2));

    // Test Technical scoring
    console.log('\n▶️  Running Technical scoring...');
    const technicalRes = await technicalFn(textDoc.applicationNumber);
    console.log('✅ Technical result:', JSON.stringify(technicalRes, null, 2));

    // Test Relevance scoring
    console.log('\n▶️  Running Relevance scoring...');
    const relevanceRes = await relevanceFn(textDoc.applicationNumber);
    console.log('✅ Relevance result:', JSON.stringify(relevanceRes, null, 2));

    // Build and save scorecard
    const scoreObj = {
      application_number: textDoc.applicationNumber,
      novelty_score: null,
      technical_score: technicalRes,
      finance_score: financeRes,
      relevance_score: relevanceRes
    };

    // Compute overall score
    const scoreVals = [];
    if (financeRes?.financial_score) scoreVals.push(Number(financeRes.financial_score));
    if (technicalRes?.technical_score) scoreVals.push(Number(technicalRes.technical_score));
    if (relevanceRes?.relevance_score) scoreVals.push(Number(relevanceRes.relevance_score));
    const overall = scoreVals.length ? (scoreVals.reduce((a,b)=>a+b,0) / scoreVals.length) : null;
    if (overall !== null) scoreObj.overall_score = Number(overall.toFixed(2));

    const saved = await ScoreCard.create(scoreObj);
    console.log('\n✅ ScoreCard saved:', saved._id);
    console.log('📊 Overall Score:', scoreObj.overall_score);

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

testScoring();
