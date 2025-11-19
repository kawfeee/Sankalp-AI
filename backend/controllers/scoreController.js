const ScoreCard = require('../models/ScoreCard');

exports.getScoreCardByApplication = async (req, res) => {
  try {
    const applicationNumber = req.params.applicationNumber;
    const score = await ScoreCard.findOne({ application_number: applicationNumber });
    if (!score) {
      return res.status(404).json({ success: false, message: 'ScoreCard not found' });
    }
    res.status(200).json({ success: true, score });
  } catch (err) {
    console.error('Get ScoreCard error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getAllScoreCards = async (req, res) => {
  try {
    const scorecards = await ScoreCard.find({});
    res.status(200).json({ success: true, scorecards });
  } catch (err) {
    console.error('Get all scorecards error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateScoreCard = async (req, res) => {
  try {
    const applicationNumber = req.params.applicationNumber;
    const {
      finance_score,
      novelty_score,
      technical_score,
      relevance_score,
      evaluator_remarks
    } = req.body;

    // Calculate overall score
    const scores = [
      finance_score?.financial_score || 0,
      novelty_score?.novelty_score || 0,
      technical_score?.technical_score || 0,
      relevance_score?.relevance_score || 0
    ];
    const overall_score = scores.reduce((a, b) => a + b, 0) / scores.length;

    const updatedScore = await ScoreCard.findOneAndUpdate(
      { application_number: applicationNumber },
      {
        finance_score,
        novelty_score,
        technical_score,
        relevance_score,
        overall_score,
        evaluator_remarks,
        updated_at: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedScore) {
      return res.status(404).json({ success: false, message: 'ScoreCard not found' });
    }

    res.status(200).json({ success: true, score: updatedScore });
  } catch (err) {
    console.error('Update ScoreCard error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
