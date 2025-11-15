const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Step 1: User Details
  institutionName: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pinCode: {
    type: String,
    required: [true, 'PIN code is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit PIN code']
  },
  
  // Step 2: Project Details
  projectTitle: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    trim: true
  },
  expectedBudget: {
    type: String,
    required: [true, 'Expected budget is required'],
    trim: true
  },
  
  // PDF file stored in Cloudinary
  pdfUrl: {
    type: String,
    required: [true, 'PDF document is required']
  },
  pdfPublicId: {
    type: String,
    required: true
  },
  pdfFileName: {
    type: String,
    required: true
  },
  
  // Unique application number
  applicationNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Overall score (for evaluators)
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
