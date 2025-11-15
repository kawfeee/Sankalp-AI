# Cloudinary Setup Guide for Sankalp AI

## 🔧 How to Get Cloudinary Credentials

### Step 1: Create a Cloudinary Account
1. Go to https://cloudinary.com/
2. Click **"Sign Up for Free"**
3. Fill in your details (or sign up with Google/GitHub)
4. Verify your email address

### Step 2: Access Your Dashboard
1. After logging in, you'll be on the **Dashboard**
2. Look for the **"Product Environment Credentials"** section at the top

### Step 3: Copy Your Credentials
You'll see three important values:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: your_api_secret_key_here
```

### Step 4: Add to Backend .env File
Open `backend/.env` and replace the placeholder values:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret_key_here
```

## 📋 Example (Don't use these - they're fake!)
```env
CLOUDINARY_CLOUD_NAME=sankalp-ai-cloud
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=abcdef123456XYZ-secretKey
```

## ✅ What's Been Implemented

### Backend Features:
1. **Cloudinary Configuration** (`config/cloudinary.js`)
   - Automatic PDF upload to Cloudinary
   - Stores files in `sankalp-ai-applications` folder
   - 10MB file size limit
   - Only accepts PDF files

2. **Application Model** (`models/Application.js`)
   - Stores all form data in MongoDB
   - Stores Cloudinary PDF URL (not the file itself)
   - Includes PDF public ID for deletion
   - Status tracking (pending, under-review, approved, rejected)

3. **Application Controller** (`controllers/applicationController.js`)
   - `POST /api/applications` - Submit application (Applicant)
   - `GET /api/applications` - Get user's applications (Applicant)
   - `GET /api/applications/:id` - Get single application
   - `GET /api/applications/all/list` - Get all applications (Evaluator)
   - `PATCH /api/applications/:id/status` - Update status (Evaluator)
   - `DELETE /api/applications/:id` - Delete application (Applicant)

4. **File Upload Flow**:
   ```
   User uploads PDF → Multer processes → 
   Cloudinary stores file → Returns URL → 
   URL saved in MongoDB → File accessible via link
   ```

### Frontend Updates:
1. **Form submission with file upload**
   - Sends FormData with multipart/form-data
   - Includes JWT token for authentication
   - Shows success/error messages

## 🚀 Testing the Setup

### 1. Start Backend Server
```bash
cd backend
node server.js
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Test Application Submission
1. Login as an applicant
2. Go to "Submit Application"
3. Fill all form steps
4. Upload a PDF file
5. Review and submit

### 4. Verify in Cloudinary
1. Go to your Cloudinary dashboard
2. Navigate to "Media Library"
3. Look for the `sankalp-ai-applications` folder
4. Your uploaded PDFs should be there!

### 5. Verify in MongoDB
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Find the `applications` collection
4. You should see your submitted application with the Cloudinary URL

## 📊 Data Flow

```
Frontend Form
    ↓
FormData with PDF file
    ↓
Backend API Endpoint
    ↓
Multer Middleware (processes file)
    ↓
Cloudinary (stores PDF, returns URL)
    ↓
MongoDB (stores form data + PDF URL)
    ↓
Success Response
    ↓
Frontend Dashboard
```

## 🔒 Security Features

1. **File Validation**: Only PDF files allowed
2. **Size Limit**: Maximum 10MB per file
3. **Authentication**: JWT token required for all operations
4. **Role-Based Access**: 
   - Applicants can only see their own applications
   - Evaluators can see all applications
5. **Cloudinary Security**: Files stored with unique IDs
6. **Auto Cleanup**: If submission fails, uploaded file is deleted from Cloudinary

## 🎯 API Endpoints

### Applicant Endpoints:
```
POST   /api/applications              - Submit new application
GET    /api/applications              - Get my applications
GET    /api/applications/:id          - Get single application
DELETE /api/applications/:id          - Delete my application
```

### Evaluator Endpoints:
```
GET    /api/applications/all/list     - Get all applications
PATCH  /api/applications/:id/status   - Update application status
GET    /api/applications/:id          - View any application
```

## 🐛 Troubleshooting

### "Upload failed" error
- Check if Cloudinary credentials are correct in .env
- Verify file is a valid PDF
- Check file size (must be under 10MB)

### "Not authorized" error
- Make sure user is logged in
- Check if JWT token is valid
- Verify user role (applicant/evaluator)

### PDF not showing in Cloudinary
- Check Cloudinary dashboard for errors
- Verify API key and secret are correct
- Check if folder name matches in config

### MongoDB connection issues
- Verify MONGODB_URI is correct
- Check if IP is whitelisted in MongoDB Atlas
- Ensure database user has write permissions

## 📝 Important Notes

1. **Free Tier Limits**: Cloudinary free tier includes:
   - 25 GB storage
   - 25 GB bandwidth/month
   - Sufficient for development and small projects

2. **Database Storage**: Only the URL is stored in MongoDB, not the actual PDF file

3. **File Deletion**: When an application is deleted, the PDF is automatically removed from Cloudinary

4. **Environment Variables**: Never commit your .env file to Git! It contains sensitive credentials.

## ✨ Next Steps

1. Set up Cloudinary account
2. Add credentials to .env file
3. Restart backend server
4. Test application submission
5. Verify files appear in Cloudinary
6. Check MongoDB for saved data

Your application is now ready to handle file uploads! 🎉
