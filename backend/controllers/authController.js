const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    if (!['evaluator', 'applicant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({ message: `This account is not registered as ${role}` });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @desc    Verify token and get user
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Error verifying token', error: error.message });
  }
};

// @desc    Get user statistics
// @route   GET /api/auth/statistics
// @access  Private (Applicant only)
exports.getUserStatistics = async (req, res) => {
  try {
    console.log('Fetching statistics for user ID:', req.user.id);
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email);
    console.log('Statistics:', {
      totalApplications: user.totalApplications,
      pendingApplications: user.pendingApplications,
      approvedApplications: user.approvedApplications
    });

    const stats = {
      totalApplications: user.totalApplications || 0,
      pendingApplications: user.pendingApplications || 0,
      approvedApplications: user.approvedApplications || 0
    };

    console.log('Sending statistics:', stats);

    res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};
