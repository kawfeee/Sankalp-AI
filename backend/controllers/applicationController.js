const Application = require('../models/Application');
const { cloudinary } = require('../config/cloudinary');

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
