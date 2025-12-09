const express = require('express');
const {
  createApplication,
  getUserApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  requestReEvaluation,
  compareSimilarity,
  getApplicationText
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Applicant routes
router.post('/', protect, restrictTo('applicant'), upload.single('pdfFile'), createApplication);
router.get('/', protect, restrictTo('applicant'), getUserApplications);

// Evaluator routes - put /all/list before /:id to avoid route conflicts
router.get('/all/list', protect, restrictTo('evaluator'), getAllApplications);

// Specific ID routes - MUST come before generic /:id route
router.get('/:id/text', protect, getApplicationText);
router.post('/:id/re-evaluate', protect, restrictTo('applicant'), requestReEvaluation);
router.patch('/:id/status', protect, restrictTo('evaluator'), updateApplicationStatus);
router.put('/:id/status', protect, restrictTo('evaluator'), updateApplicationStatus);

// Generic ID routes - MUST come last
router.get('/:id', protect, getApplicationById);
router.delete('/:id', protect, restrictTo('applicant'), deleteApplication);

// Compare similarity (both roles)
router.post('/compare-similarity', protect, compareSimilarity);

module.exports = router;
