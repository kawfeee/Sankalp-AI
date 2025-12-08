// Test script to verify email OTP functionality
require('dotenv').config();
const { sendOTPEmail } = require('./config/nodemailer');

async function testEmailSetup() {
  console.log('🧪 Testing Email OTP Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not Set');
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ ERROR: Email credentials not configured in .env file');
    process.exit(1);
  }
  
  // Generate test OTP
  const testOTP = Math.floor(1000 + Math.random() * 9000).toString();
  console.log('🔢 Generated Test OTP:', testOTP);
  console.log('');
  
  // Attempt to send email
  console.log('📨 Sending test email to:', process.env.EMAIL_USER);
  console.log('⏳ Please wait...\n');
  
  try {
    const result = await sendOTPEmail(process.env.EMAIL_USER, testOTP);
    console.log('✅ SUCCESS! Email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('');
    console.log('🎉 Email configuration is working correctly!');
    console.log('📧 Check your inbox for the OTP email.');
    console.log('');
    console.log('Next steps:');
    console.log('1. ✓ Email setup verified');
    console.log('2. Start backend: npm start');
    console.log('3. Start frontend: cd ../frontend && npm run dev');
    console.log('4. Test login flow with OTP');
  } catch (error) {
    console.error('❌ FAILED to send email!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify EMAIL_USER is correct in .env');
    console.error('2. Verify EMAIL_PASSWORD is the App Password (16 chars)');
    console.error('3. Enable 2FA on Gmail account');
    console.error('4. Generate new App Password at: https://myaccount.google.com/apppasswords');
    console.error('5. Check if Gmail is blocking the connection');
  }
}

testEmailSetup();
