# 🔐 OTP Authentication - Quick Start

## ⚡ Quick Setup (3 Steps)

### 1. Install Dependencies
```powershell
cd backend
npm install
```

### 2. Configure Email in `.env`
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Get Gmail App Password:**
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" → "Other" → Name it "Sankalp-AI"
4. Copy the 16-character password

### 3. Start Servers
```powershell
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## 🎯 How It Works

1. **User Login** → Enter email + password
2. **System** → Validates credentials
3. **System** → Generates 4-digit OTP
4. **System** → Sends OTP via email
5. **User** → Checks email
6. **User** → Enters OTP
7. **System** → Verifies OTP
8. **User** → ✅ Logged in with JWT token

---

## 🧪 Test Login

### Applicant Login
- Navigate to: `http://localhost:5173/login/applicant`
- Enter credentials
- Check email for OTP
- Enter OTP to complete login

### Evaluator Login
- Navigate to: `http://localhost:5173/login/evaluator`
- Same OTP flow

---

## 📧 Email Template

You'll receive a professional email with:
- 🎨 Gradient header
- 🔢 Large 4-digit OTP code
- ⏰ 5-minute expiry notice
- 🛡️ Security warning

---

## 🔧 Troubleshooting

### Email Not Received?
- ✓ Check spam/junk folder
- ✓ Verify `.env` email credentials
- ✓ Ensure App Password is correct (no spaces)
- ✓ Check backend console for errors

### OTP Invalid?
- ✓ Enter OTP within 5 minutes
- ✓ Check for typos
- ✓ Request new OTP if expired

### Login Issues?
- ✓ Check backend is running (port 5000)
- ✓ Check frontend is running (port 5173)
- ✓ Clear browser localStorage
- ✓ Check browser console for errors

---

## 📁 Modified Files

### Backend
- ✅ `models/User.js` - Added OTP fields
- ✅ `config/nodemailer.js` - Email configuration
- ✅ `controllers/authController.js` - Login + OTP verification
- ✅ `routes/authRoutes.js` - New verify-otp route
- ✅ `.env` - Email credentials
- ✅ `package.json` - Added nodemailer

### Frontend
- ✅ `pages/ApplicantLogin.jsx` - Two-step OTP flow
- ✅ `pages/EvaluatorLogin.jsx` - Two-step OTP flow

---

## 🔒 Security Features

- ✅ Password hashing (bcrypt)
- ✅ OTP expiry (5 minutes)
- ✅ JWT tokens (30 days)
- ✅ Role-based access
- ✅ Input validation
- ✅ Secure email delivery

---

## 📖 Full Documentation

See `OTP_AUTHENTICATION_SETUP.md` for:
- Complete implementation details
- API endpoint documentation
- Testing scenarios
- Advanced troubleshooting
- Optional enhancements

---

## ✅ Pre-Launch Checklist

- [ ] Email credentials configured
- [ ] Test email sending works
- [ ] Test complete login flow
- [ ] Test OTP expiry
- [ ] Test error scenarios
- [ ] Verify on multiple browsers
- [ ] Check mobile responsiveness

---

## 🎉 You're Ready!

Your authentication system now includes:
- 📧 Email OTP verification
- 🔐 Secure JWT tokens
- 🎨 Beautiful UI/UX
- 🛡️ Production-ready security

**Happy Coding! 🚀**
