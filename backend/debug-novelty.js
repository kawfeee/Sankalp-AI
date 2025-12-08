require('dotenv').config();
const mongoose = require('mongoose');
const ScoreCard = require('./models/ScoreCard');

async function checkNovelty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const latest = await ScoreCard.findOne().sort({ createdAt: -1 });
    
    if (latest) {
      console.log('\n=== LATEST SCORECARD ===');
      console.log('Application:', latest.application_number);
      console.log('\nNovelty Score Object:');
      console.log(JSON.stringify(latest.novelty_score, null, 2));
    } else {
      console.log('No scorecards found');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkNovelty();
