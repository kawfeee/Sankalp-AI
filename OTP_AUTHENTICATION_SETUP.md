# 🔐 OTP-Based Authentication System - Setup Guide

## ✅ Implementation Complete

A complete MERN authentication system with email OTP verification has been successfully implemented.

---

## 📋 What Has Been Implemented

### Backend Changes

#### 1. **User Model Updates** (`backend/models/User.js`)
Added OTP-related fields:
```javascript
otp: { type: String, select: false }
otpExpiry: { type: Date, select: false }
isOTPVerified: { type: Boolean, default: false }
```

#### 2. **Nodemailer Configuration** (`backend/config/nodemailer.js`)
- Created email transporter using Gmail
- Beautiful HTML email template with OTP
- Configured to send 4-digit OTP codes

#### 3. **Auth Controller Updates** (`backend/controllers/authController.js`)
**New Login Flow:**
- `POST /api/auth/login` - Validates credentials, generates OTP, sends email
- `POST /api/auth/verify-otp` - Verifies OTP and issues JWT token

**Features:**
- 4-digit OTP generation (1000-9999)
- 5-minute OTP expiry
- Email validation
- Password verification before OTP
- Secure JWT token issuance only after OTP verification

#### 4. **Auth Routes** (`backend/routes/authRoutes.js`)
Added new route:
```javascript
router.post('/verify-otp', verifyOTP);
```

#### 5. **Environment Variables** (`backend/.env`)
Added email configuration:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Frontend Changes

#### 1. **ApplicantLogin Component** (`frontend/src/pages/ApplicantLogin.jsx`)
- Two-step authentication UI
- Step 1: Email + Password → Sends OTP
- Step 2: OTP Input → Verifies and logs in
- Beautiful success/error alerts
- Auto-redirect to dashboard after successful login

#### 2. **EvaluatorLogin Component** (`frontend/src/pages/EvaluatorLogin.jsx`)
- Same two-step OTP flow for evaluators
- Consistent UI/UX with applicant login
- Role-specific navigation

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

If not already installed, run:
```bash
# Backend
cd backend
npm install nodemailer

# Frontend (axios should already be installed)
cd ../frontend
npm install axios
```

### Step 2: Configure Email Service

#### Option A: Using Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Sankalp-AI OTP"
   - Copy the 16-character password

3. **Update `.env` file:**
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

#### Option B: Using Other Email Services

Update `backend/config/nodemailer.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',  // Your SMTP host
  port: 587,                  // SMTP port
  secure: false,              // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Step 3: Test the System

1. **Start Backend:**
```bash
cd backend
npm start
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Test Login Flow:**
   - Navigate to `/login/applicant` or `/login/evaluator`
   - Enter valid credentials
   - Check email for OTP
   - Enter OTP to complete login

---

## 🔄 Authentication Flow Diagram

```
User Login
    ↓
Enter Email + Password
    ↓
Backend: Validate Credentials
    ↓
Generate 4-digit OTP
    ↓
Save OTP + Expiry to Database
    ↓
Send OTP via Email
    ↓
User: Check Email
    ↓
Enter OTP in UI
    ↓
Backend: Verify OTP
    ↓
✓ OTP Valid → Issue JWT Token
    ↓
User: Redirected to Dashboard
```

---

## 📧 Email Template Preview

The OTP email includes:
- Professional header with gradient
- Large, centered OTP code (4 digits)
- 5-minute expiry notice
- Security warning for unauthorized attempts
- Ministry of Coal branding

---

## 🎨 UI Features

### Login Form
- Clean, modern design
- Email and password inputs
- "Send OTP" button
- Error/Success alerts

### OTP Verification Form
- Info banner showing email
- Large 4-digit input field (centered, bold)
- Expiry countdown message
- "Verify & Login" button
- "Back to Login" button

---

## 🔒 Security Features

1. **Password Hashing:** bcrypt (12 rounds)
2. **OTP Expiry:** 5 minutes
3. **JWT Tokens:** 30-day expiry
4. **Role-Based Access:** Separate flows for applicant/evaluator
5. **Input Validation:** Email format, OTP digits only
6. **Error Handling:** Descriptive error messages without exposing system details

---

## 🧪 Testing Scenarios

### Test Case 1: Successful Login
1. Enter valid email + password
2. Receive OTP via email
3. Enter correct OTP within 5 minutes
4. Successfully logged in and redirected

### Test Case 2: Invalid Credentials
1. Enter wrong email or password
2. Error: "Invalid email or password"
3. OTP not sent

### Test Case 3: Expired OTP
1. Request OTP
2. Wait more than 5 minutes
3. Enter OTP
4. Error: "OTP has expired. Please login again."

### Test Case 4: Wrong OTP
1. Request OTP
2. Enter incorrect OTP
3. Error: "Invalid OTP. Please try again."

### Test Case 5: Email Sending Failure
1. Misconfigured email credentials
2. Error: "Failed to send OTP email. Please try again."

---

## 🐛 Troubleshooting

### Email Not Sending

**Issue:** OTP email not received

**Solutions:**
1. Check `.env` file has correct `EMAIL_USER` and `EMAIL_PASSWORD`
2. Verify Gmail App Password is correct (16 characters, no spaces)
3. Check spam/junk folder
4. Enable "Less secure app access" if not using App Password
5. Check backend console for error messages

### OTP Always Invalid

**Issue:** Correct OTP shows as invalid

**Solutions:**
1. Check server time is synchronized
2. Verify OTP hasn't expired (5 min limit)
3. Check database for OTP field updates
4. Look for console errors in backend

### Cannot Login After OTP Verification

**Issue:** OTP verified but not logged in

**Solutions:**
1. Check JWT_SECRET is set in `.env`
2. Verify localStorage is enabled in browser
3. Check browser console for errors
4. Ensure AuthContext is properly set up

---

## 📱 API Endpoints

### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "applicant"
}
```

**Response:**
```json
{
  "success": true,
  "nextStep": "VERIFY_OTP",
  "message": "OTP has been sent to your email",
  "email": "user@example.com"
}
```

### POST `/api/auth/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "applicant"
  },
  "message": "Login successful"
}
```

---

## 📝 Environment Variables Checklist

Make sure these are set in `backend/.env`:

- [x] `MONGODB_URI` - MongoDB connection string
- [x] `JWT_SECRET` - Secret key for JWT
- [ ] `EMAIL_USER` - Your email address (⚠️ Update this!)
- [ ] `EMAIL_PASSWORD` - App-specific password (⚠️ Update this!)
- [x] `PORT` - Server port (5000)

---

## 🎯 Next Steps (Optional Enhancements)

1. **Resend OTP Button:** Allow users to request new OTP
2. **SMS OTP Option:** Add SMS-based OTP as alternative
3. **Remember Device:** Option to skip OTP on trusted devices
4. **Rate Limiting:** Prevent OTP spam (max 5 attempts per hour)
5. **OTP Attempt Tracking:** Lock account after 5 wrong attempts
6. **Email Queue:** Use Redis/Bull for reliable email delivery
7. **Two-Factor Authentication:** Make OTP mandatory for admin roles

---

## ✅ Verification Checklist

Before going live:

- [ ] Email credentials configured in `.env`
- [ ] Test email sending with real email address
- [ ] Test complete login flow (both applicant & evaluator)
- [ ] Verify OTP expiry works correctly
- [ ] Test error scenarios (wrong password, expired OTP, etc.)
- [ ] Check email arrives in inbox (not spam)
- [ ] Verify JWT tokens work correctly
- [ ] Test on different browsers
- [ ] Check mobile responsiveness

---

## 🎉 Success!

Your MERN application now has a production-ready OTP-based authentication system with:
- ✅ Email verification
- ✅ Secure JWT tokens
- ✅ Beautiful UI/UX
- ✅ Comprehensive error handling
- ✅ Role-based access control

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review backend console logs
3. Check browser developer console
4. Verify all environment variables are set correctly

**Happy Coding! 🚀**
