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
