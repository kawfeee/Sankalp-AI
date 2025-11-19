const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const ScoreCard = require('./models/ScoreCard');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const sc = await ScoreCard.findOne({application_number: '20251119-11'});
  console.log('Novelty Score:', sc.novelty_score.novelty_score, '/10');
  console.log('Overall Score:', sc.overall_score, '/10');
  process.exit(0);
});
