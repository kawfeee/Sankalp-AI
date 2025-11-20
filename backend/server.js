// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected Successfully');
    } else {
      console.log('MongoDB URI not provided. Running without database connection.');
      console.log('Add MONGODB_URI to .env file to enable database features.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Server running without database connection');
  }
};

// Connect to database
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sankalp AI Backend API' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/scorecard', scoreRoutes);
app.use('/api/summary', summaryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
