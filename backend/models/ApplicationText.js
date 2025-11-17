const mongoose = require('mongoose');

const applicationTextSchema = new mongoose.Schema({
  // Reference to the application
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // Application number for easy reference
  applicationNumber: {
    type: String,
    required: true
  },
  
  // User who submitted the application
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Extracted text content from PDF
  extractedText: {
    type: String,
    required: true
  },
  
  // Metadata about the extraction
  pdfFileName: {
    type: String,
    required: true
  },
  
  textLength: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  extractedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
applicationTextSchema.index({ applicationNumber: 1 });
applicationTextSchema.index({ userId: 1 });
applicationTextSchema.index({ applicationId: 1 });

const ApplicationText = mongoose.model('ApplicationText', applicationTextSchema);

module.exports = ApplicationText;
