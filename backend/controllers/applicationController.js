const Application = require('../models/Application');
const ApplicationText = require('../models/ApplicationText');
const { cloudinary } = require('../config/cloudinary');
const { PDFParse } = require('pdf-parse');
const axios = require('axios');
const ScoreCard = require('../models/ScoreCard');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Applicant only)
exports.createApplication = async (req, res) => {
  try {
    console.log('Received application submission');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);

    const {
      institutionName,
      address,
      city,
      state,
      pinCode,
      projectTitle,
      domain,
      problemStatement,
      expectedBudget
    } = req.body;

    // Check if PDF file was uploaded
    if (!req.file) {
      console.log('Error: No file uploaded');
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Generate application number (YYYYMMDD-count)
    const today = new Date();
    const datePrefix = today.getFullYear().toString() + 
                      (today.getMonth() + 1).toString().padStart(2, '0') + 
                      today.getDate().toString().padStart(2, '0');
    
    // Get total count of applications to generate unique number
    const totalApplications = await Application.countDocuments();
    const applicationNumber = `${datePrefix}-${totalApplications + 1}`;

    // Create application with PDF URL from Cloudinary
    const application = await Application.create({
      userId: req.user.id,
      institutionName,
      address,
      city,
      state,
      pinCode,
      projectTitle,
      domain,
      problemStatement,
      expectedBudget,
      pdfUrl: req.file.path, // Cloudinary URL
      pdfPublicId: req.file.filename, // Cloudinary public ID
      pdfFileName: req.file.originalname,
      applicationNumber
    });

    console.log('Application created successfully:', application.applicationNumber);
    
    // Update user statistics
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 
        totalApplications: 1,
        pendingApplications: 1
      }
    });

    // Extract text from PDF and store in ApplicationText collection
    try {
      console.log('=== Starting PDF Text Extraction ===');
      console.log('PDF URL:', req.file.path);
      
      // Download PDF from Cloudinary
      console.log('Downloading PDF from Cloudinary...');
      const response = await axios.get(req.file.path, {
        responseType: 'arraybuffer'
      });
      
      console.log('PDF downloaded, size:', response.data.byteLength, 'bytes');
      const pdfBuffer = Buffer.from(response.data);
      
      // Parse PDF and extract text using PDFParse v2 API
      console.log('Parsing PDF and extracting text...');
      const parser = new PDFParse({ data: pdfBuffer });
      const result = await parser.getText();
      const extractedText = result.text;
      
      console.log('Text extraction successful!');
      console.log('Extracted text length:', extractedText.length, 'characters');
      console.log('First 100 characters:', extractedText.substring(0, 100));
      
      // Store extracted text in ApplicationText collection
      console.log('Saving to ApplicationText collection...');
      const textDoc = await ApplicationText.create({
        applicationId: application._id,
        applicationNumber: application.applicationNumber,
        userId: req.user.id,
        extractedText: extractedText,
        pdfFileName: req.file.originalname,
        textLength: extractedText.length
      });
      
      console.log('✅ Extracted text stored successfully! Document ID:', textDoc._id);
      console.log('=== PDF Text Extraction Complete ===');

      // Orchestrate evaluation functions in background (run only once per application)
      (async () => {
        try {
          const existing = await ScoreCard.findOne({ application_number: application.applicationNumber });
          if (existing) {
            console.log('ScoreCard already exists for', application.applicationNumber, ' — skipping scoring');
            return;
          }

          // Load evaluation functions
          const financeFn = require('../Evaluation_Functions/finance_test');
          const technicalFn = require('../Evaluation_Functions/technical_test');
          const relevanceFn = require('../Evaluation_Functions/relevance_test');
          const noveltyFn = require('../Evaluation_Functions/novelty_test');

          const wait = (ms) => new Promise((r) => setTimeout(r, ms));

          let financeRes = null;
          try {
            console.log('▶️ Running Finance scoring for', application.applicationNumber);
            financeRes = await financeFn(application.applicationNumber);
            console.log('Finance result:', financeRes);
          } catch (e) {
            console.error('Finance scoring failed:', e.message);
          }

          await wait(5000);

          let technicalRes = null;
          try {
            console.log('▶️ Running Technical scoring for', application.applicationNumber);
            technicalRes = await technicalFn(application.applicationNumber);
            console.log('Technical result:', technicalRes);
          } catch (e) {
            console.error('Technical scoring failed:', e.message);
          }

          await wait(5000);

          let relevanceRes = null;
          try {
            console.log('▶️ Running Relevance scoring for', application.applicationNumber);
            relevanceRes = await relevanceFn(application.applicationNumber);
            console.log('Relevance result:', relevanceRes);
          } catch (e) {
            console.error('Relevance scoring failed:', e.message);
          }

          await wait(5000);

          let noveltyRes = null;
          try {
            console.log('▶️ Running Novelty scoring for', application.applicationNumber);
            noveltyRes = await noveltyFn(application.applicationNumber);
            console.log('Novelty result:', noveltyRes);
          } catch (e) {
            console.error('Novelty scoring failed:', e.message);
          }

          // Build ScoreCard document per spec
          const scoreObj = {
            application_number: application.applicationNumber,
            novelty_score: noveltyRes ? {
              application_number: noveltyRes.application_number || application.applicationNumber,
              novelty_score: noveltyRes.novelty_scores && typeof noveltyRes.novelty_scores === 'object' 
                ? ((Number(noveltyRes.novelty_scores.originality_score) + 
                    Number(noveltyRes.novelty_scores.technical_novelty_score) + 
                    Number(noveltyRes.novelty_scores.application_novelty_score)) / 30)
                : (Number(noveltyRes.novelty_score) ? Number(noveltyRes.novelty_score) / 10 : null),
              total_proposals_checked: Number(noveltyRes.total_proposals_checked) || 0,
              novelty_scores: noveltyRes.novelty_scores && typeof noveltyRes.novelty_scores === 'object' ? {
                originality_score: Number(noveltyRes.novelty_scores.originality_score) || 0,
                technical_novelty_score: Number(noveltyRes.novelty_scores.technical_novelty_score) || 0,
                application_novelty_score: Number(noveltyRes.novelty_scores.application_novelty_score) || 0
              } : undefined,
              similar_proposals: Array.isArray(noveltyRes.similar_proposals) ? noveltyRes.similar_proposals : []
            } : null,
            technical_score: technicalRes ? {
              technical_score: Number(technicalRes.technical_score) || null,
              approach_clarity_score: Number(technicalRes.approach_clarity_score) || null,
              resource_availability_score: Number(technicalRes.resource_availability_score) || null,
              timeline_feasibility_score: Number(technicalRes.timeline_feasibility_score) || null,
              technical_risks: Array.isArray(technicalRes.technical_risks) ? technicalRes.technical_risks : []
            } : undefined,
            finance_score: financeRes ? {
              financial_score: Number(financeRes.financial_score) || null,
              commercialization_potential: Number(financeRes.commercialization_potential) || null,
              financial_risks: Array.isArray(financeRes.financial_risks) ? financeRes.financial_risks : []
            } : undefined,
            relevance_score: relevanceRes ? {
              relevance_score: Number(relevanceRes.relevance_score) || null,
              industry_applicability_score: Number(relevanceRes.industry_applicability_score) || null,
              ministry_alignment_score: Number(relevanceRes.ministry_alignment_score) || null,
              safety_environmental_impact_score: Number(relevanceRes.safety_environmental_impact_score) || null,
              psu_adoptability_score: Number(relevanceRes.psu_adoptability_score) || null
            } : undefined
          };

          // Compute overall score as average of available primary scores (including novelty)
          const scoreVals = [];
          if (scoreObj.finance_score && typeof scoreObj.finance_score.financial_score === 'number') scoreVals.push(scoreObj.finance_score.financial_score);
          if (scoreObj.technical_score && typeof scoreObj.technical_score.technical_score === 'number') scoreVals.push(scoreObj.technical_score.technical_score);
          if (scoreObj.novelty_score && typeof scoreObj.novelty_score.novelty_score === 'number') scoreVals.push(scoreObj.novelty_score.novelty_score);
          if (scoreObj.relevance_score && typeof scoreObj.relevance_score.relevance_score === 'number') scoreVals.push(scoreObj.relevance_score.relevance_score);
          const overall = scoreVals.length ? (scoreVals.reduce((a,b)=>a+b,0) / scoreVals.length) : null;
          if (overall !== null) scoreObj.overall_score = Number(overall.toFixed(2));

          // Upsert into ScoreCard collection
          await ScoreCard.findOneAndUpdate(
            { application_number: application.applicationNumber },
            { $set: scoreObj },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          console.log('✅ ScoreCard saved for', application.applicationNumber);
        } catch (err) {
          console.error('Scoring orchestration error:', err);
        }
      })();
    } catch (extractError) {
      console.error('❌ PDF text extraction error:', extractError.message);
      console.error('Error stack:', extractError.stack);
      // Don't fail the application submission if text extraction fails
      // Just log the error and continue
    }
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    console.error('Error stack:', error.stack);
    
    // If there's an error and file was uploaded, delete it from Cloudinary
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error creating application', 
      error: error.message,
      details: error.stack
    });
  }
};

// @desc    Get all applications for logged-in user
// @route   GET /api/applications
// @access  Private (Applicant only)
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      message: 'Error fetching applications', 
      error: error.message 
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application or is an evaluator
    if (application.userId._id.toString() !== req.user.id && req.user.role !== 'evaluator') {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ 
      message: 'Error fetching application', 
      error: error.message 
    });
  }
};

// @desc    Get all applications (for evaluators)
// @route   GET /api/applications/all
// @access  Private (Evaluator only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ 
      message: 'Error fetching applications', 
      error: error.message 
    });
  }
};

// @desc    Update application status (for evaluators)
// @route   PATCH /api/applications/:id/status
// @access  Private (Evaluator only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'under-review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Get old application to check previous status
    const oldApplication = await Application.findById(req.params.id);
    if (!oldApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    // Update user statistics based on status change
    const User = require('../models/User');
    const oldStatus = oldApplication.status;
    const newStatus = status;

    if (oldStatus !== newStatus) {
      const updates = {};
      
      // Decrease old status count
      if (oldStatus === 'pending') updates.pendingApplications = -1;
      if (oldStatus === 'approved') updates.approvedApplications = -1;
      
      // Increase new status count
      if (newStatus === 'pending') updates.pendingApplications = (updates.pendingApplications || 0) + 1;
      if (newStatus === 'approved') updates.approvedApplications = (updates.approvedApplications || 0) + 1;
      
      await User.findByIdAndUpdate(application.userId, {
        $inc: updates
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      message: 'Error updating application status', 
      error: error.message 
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Owner only)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application
    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    // Delete PDF from Cloudinary
    if (application.pdfPublicId) {
      try {
        await cloudinary.uploader.destroy(application.pdfPublicId, { resource_type: 'raw' });
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ 
      message: 'Error deleting application', 
      error: error.message 
    });
  }
};

// @desc    Request re-evaluation for rejected application
// @route   POST /api/applications/:id/re-evaluate
// @access  Private (Applicant only)
exports.requestReEvaluation = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application
    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to request re-evaluation for this application' });
    }

    // Check if application is rejected
    if (application.status !== 'rejected') {
      return res.status(400).json({ message: 'Only rejected applications can be re-evaluated' });
    }

    // Update application status to pending and update created date
    application.status = 'pending';
    application.submittedAt = new Date();
    application.updatedAt = new Date();
    await application.save();

    // Update user statistics
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 
        pendingApplications: 1
      }
    });

    res.status(200).json({
      success: true,
      message: 'Re-evaluation request submitted successfully',
      application
    });
  } catch (error) {
    console.error('Request re-evaluation error:', error);
    res.status(500).json({ 
      message: 'Error requesting re-evaluation', 
      error: error.message 
    });
  }
};
