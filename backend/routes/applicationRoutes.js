const express = require('express');
const {
  createApplication,
  getUserApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Applicant routes
router.post('/', protect, restrictTo('applicant'), upload.single('pdfFile'), createApplication);
router.get('/', protect, restrictTo('applicant'), getUserApplications);
router.get('/:id', protect, getApplicationById);
router.delete('/:id', protect, restrictTo('applicant'), deleteApplication);

// Evaluator routes
router.get('/all/list', protect, restrictTo('evaluator'), getAllApplications);
router.patch('/:id/status', protect, restrictTo('evaluator'), updateApplicationStatus);

module.exports = router;
