# Quick Setup Script for OTP Authentication
# Run this after updating the code

Write-Host "🚀 Setting up OTP Authentication System..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
cd backend
npm install nodemailer
Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green
Write-Host ""

# Check .env file
Write-Host "⚙️ Checking configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Check if email credentials are configured
    $envContent = Get-Content .env -Raw
    if ($envContent -match "EMAIL_USER=your-email@gmail.com") {
        Write-Host "⚠️  WARNING: Email credentials not configured!" -ForegroundColor Red
        Write-Host ""
        Write-Host "📧 Please update the following in backend/.env:" -ForegroundColor Cyan
        Write-Host "   EMAIL_USER=your-actual-email@gmail.com"
        Write-Host "   EMAIL_PASSWORD=your-app-specific-password"
        Write-Host ""
        Write-Host "📝 To get Gmail App Password:" -ForegroundColor Cyan
        Write-Host "   1. Enable 2FA on your Gmail account"
        Write-Host "   2. Visit: https://myaccount.google.com/apppasswords"
        Write-Host "   3. Generate an app password"
        Write-Host "   4. Copy the 16-character password"
        Write-Host ""
    } else {
        Write-Host "✅ Email credentials appear to be configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Summary of Changes:" -ForegroundColor Cyan
Write-Host "   ✓ User model updated with OTP fields"
Write-Host "   ✓ Nodemailer configuration created"
Write-Host "   ✓ Auth routes updated (login + verify-otp)"
Write-Host "   ✓ Frontend login components updated"
Write-Host "   ✓ Beautiful email template created"
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Configure email credentials in backend/.env"
Write-Host "   2. Start backend: cd backend && npm start"
Write-Host "   3. Start frontend: cd frontend && npm run dev"
Write-Host "   4. Test the login flow!"
Write-Host ""

Write-Host "📖 For detailed setup instructions, see:" -ForegroundColor Yellow
Write-Host "   OTP_AUTHENTICATION_SETUP.md"
Write-Host ""

Write-Host "✨ Setup complete! Happy coding! 🚀" -ForegroundColor Green
