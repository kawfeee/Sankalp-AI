const mongoose = require('mongoose');

const ScoreCardSchema = new mongoose.Schema({
  application_number: { type: String, required: true, unique: true },
  novelty_score: {
    application_number: String,
    novelty_score: Number,
    total_proposals_checked: Number,
    novelty_scores: {
      originality_score: Number,
      technical_novelty_score: Number,
      application_novelty_score: Number
    },
    similar_proposals: [
      {
        application_number: String,
        similarity_percentage: Number
      }
    ]
  },
  technical_score: {
    technical_score: Number,
    approach_clarity_score: Number,
    resource_availability_score: Number,
    timeline_feasibility_score: Number,
    technical_risks: [String]
  },
  finance_score: {
    financial_score: Number,
    commercialization_potential: Number,
    financial_risks: [String]
  },
  relevance_score: {
    relevance_score: Number,
    industry_applicability_score: Number,
    ministry_alignment_score: Number,
    safety_environmental_impact_score: Number,
    psu_adoptability_score: Number,
    relevant_areas: [String]
  },
  overall_score: { type: Number, default: null },
  evaluator_remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScoreCard', ScoreCardSchema);
