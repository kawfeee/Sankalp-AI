const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../config/nodemailer');
const bcrypt = require('bcryptjs');

// Emails that bypass OTP authentication
const WHITELIST_EMAILS = [
  'hemanth@gmail.com',
  'kaif@gmail.com'
];

// Temporary storage for pending signups (cleared after OTP verification)
const pendingSignups = new Map();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '30d'
  });
};

// @desc    Register user (Step 1: Store temporarily and send OTP)
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

    // Check if email is whitelisted - bypass OTP for these users
    if (WHITELIST_EMAILS.includes(email.toLowerCase())) {
      console.log(`🔓 Whitelisted email signup: ${email} - bypassing OTP`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user directly
      const userData = {
        name,
        email,
        password: hashedPassword,
        role,
        isOTPVerified: true,
        createdAt: new Date()
      };
      
      const result = await User.collection.insertOne(userData);
      const user = await User.findById(result.insertedId);
      
      // Generate token
      const token = generateToken(user._id);
      
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'User registered successfully (no OTP required)'
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set OTP expiry (5 minutes from now)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Hash the password manually before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Store signup data temporarily (will create user after OTP verification)
    pendingSignups.set(email, {
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpiry,
      type: 'signup',
      timestamp: Date.now()
    });

    console.log(`📝 Stored pending signup for ${email} with OTP: ${otp}`);
    console.log(`💾 Total pending signups: ${pendingSignups.size}`);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      console.log(`✅ Signup OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      pendingSignups.delete(email);
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.',
        error: emailError.message 
      });
    }

    res.status(200).json({
      success: true,
      nextStep: 'VERIFY_OTP',
      message: 'OTP has been sent to your email. Verify to complete registration.',
      email: email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error processing signup', error: error.message });
  }
};

// @desc    Login user (Step 1: Validate credentials and send OTP)
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
    const user = await User.findOne({ email }).select('+password +otp +otpExpiry');

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

    // Check if email is whitelisted - bypass OTP for these users
    if (WHITELIST_EMAILS.includes(email.toLowerCase())) {
      console.log(`🔓 Whitelisted email login: ${email} - bypassing OTP`);
      
      // Generate token directly
      const token = generateToken(user._id);
      
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'Login successful (no OTP required)'
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set OTP expiry (5 minutes from now)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Store OTP temporarily for login
    pendingSignups.set(email, {
      userId: user._id,
      email,
      otp,
      otpExpiry,
      type: 'login',
      timestamp: Date.now()
    });

    console.log(`📝 Stored pending login for ${email} with OTP: ${otp}`);
    console.log(`💾 Total pending sessions: ${pendingSignups.size}`);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      console.log(`✅ Login OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      pendingSignups.delete(email);
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again.',
        error: emailError.message 
      });
    }

    res.status(200).json({
      success: true,
      nextStep: 'VERIFY_OTP',
      message: 'OTP has been sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @desc    Verify OTP (Step 2: Verify OTP and complete registration/login)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    console.log(`\n🔍 Verifying OTP for: ${email}`);
    console.log(`💾 Current pending sessions: ${pendingSignups.size}`);
    console.log(`📋 Available emails:`, Array.from(pendingSignups.keys()));

    // Get pending data from temporary storage
    const pendingData = pendingSignups.get(email);

    if (!pendingData) {
      console.log(`❌ No pending data found for ${email}`);
      return res.status(400).json({ message: 'No OTP request found. Please login/signup again.' });
    }

    console.log(`✅ Found pending data for ${email} (type: ${pendingData.type})`);

    // Debug logging
    console.log('\n🔍 OTP VERIFICATION DEBUG:');
    console.log('Email:', email);
    console.log('Pending Data Type:', pendingData.type);
    console.log('Stored OTP:', pendingData.otp, '(type:', typeof pendingData.otp, 'length:', pendingData.otp?.length, ')');
    console.log('Received OTP:', otp, '(type:', typeof otp, 'length:', otp?.length, ')');
    console.log('Direct Match (===):', pendingData.otp === otp);
    console.log('String Match:', String(pendingData.otp) === String(otp));
    console.log('Trimmed Match:', String(pendingData.otp).trim() === String(otp).trim());

    // Check if OTP matches (ensure both are strings and trimmed)
    const storedOTP = String(pendingData.otp).trim();
    const receivedOTP = String(otp).trim();
    
    if (storedOTP !== receivedOTP) {
      console.log('❌ OTP MISMATCH!');
      console.log('Expected:', storedOTP);
      console.log('Received:', receivedOTP);
      return res.status(401).json({ message: 'Invalid OTP. Please try again.' });
    }
    
    console.log('✅ OTP MATCHED!');

    // Check if OTP has expired
    if (new Date() > pendingData.otpExpiry) {
      pendingSignups.delete(email);
      return res.status(401).json({ message: 'OTP has expired. Please try again.' });
    }

    let user;

    // Handle signup - create user in database NOW
    if (pendingData.type === 'signup') {
      // Insert directly into database with already-hashed password
      const userData = {
        name: pendingData.name,
        email: pendingData.email,
        password: pendingData.password, // Already hashed in signup function
        role: pendingData.role,
        isOTPVerified: true,
        createdAt: new Date()
      };
      
      // Use insertOne to bypass pre-save hooks
      const result = await User.collection.insertOne(userData);
      
      // Fetch the created user
      user = await User.findById(result.insertedId);
      console.log(`✅ User registered successfully: ${email}`);
    } 
    // Handle login - just fetch existing user
    else if (pendingData.type === 'login') {
      user = await User.findById(pendingData.userId);
      if (!user) {
        pendingSignups.delete(email);
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`✅ User logged in successfully: ${email}`);
    }

    // Clear pending data
    pendingSignups.delete(email);

    // Generate JWT token
    const token = generateToken(user._id);

    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: pendingData.type === 'signup' ? 'Registration successful' : 'Login successful'
    };

    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2));

    res.status(200).json(responseData);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
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
