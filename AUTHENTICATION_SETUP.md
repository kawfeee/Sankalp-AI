# Authentication Setup Guide - Sankalp AI

## Overview
Role-based authentication system with JWT tokens for **Evaluator** and **Applicant** roles.

## 🎯 What Has Been Implemented

### Frontend (React)
✅ **Authentication Context** (`src/context/AuthContext.jsx`)
- Manages user state and authentication
- Handles login, signup, and logout
- Stores JWT token in localStorage
- Axios integration with automatic token headers

✅ **Role Selection Modal** (`src/components/RoleSelectionModal.jsx`)
- Appears when clicking "Login" button
- Two options: Login as Evaluator or Applicant

✅ **Separate Login Pages**
- `/login/evaluator` - Evaluator login page (purple theme)
- `/login/applicant` - Applicant login page (blue theme)

✅ **Separate Signup Pages**
- `/signup/evaluator` - Evaluator registration
- `/signup/applicant` - Applicant registration

✅ **Protected Dashboards**
- `/evaluator/dashboard` - Only accessible by evaluators
- `/applicant/dashboard` - Only accessible by applicants
- Automatic role-based route protection

✅ **React Router Setup**
- All routes configured
- Protected route component
- Navigation between pages

### Backend (Node.js + Express)

✅ **User Model** (`models/User.js`)
- Fields: name, email, password (hashed), role, createdAt
- Role enum: ['evaluator', 'applicant']
- Password hashing with bcryptjs
- Password comparison method

✅ **Authentication Controller** (`controllers/authController.js`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with role verification
- `GET /api/auth/verify` - Verify JWT token

✅ **Auth Middleware** (`middleware/authMiddleware.js`)
- JWT token verification
- Role-based access control
- Protect routes

✅ **Server Configuration** (`server.js`)
- MongoDB connection setup
- Auth routes integrated
- CORS enabled
- Error handling

## 📦 Installation Steps

### Backend Setup
```bash
cd backend
npm install express cors dotenv mongoose bcryptjs jsonwebtoken nodemon --save-dev
```

### Frontend Setup
```bash
cd frontend
npm install react-router-dom axios
```

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier is fine)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Configure Backend
1. Open `backend/.env`
2. Replace the MONGODB_URI line with your connection string:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/sankalp-ai?retryWrites=true&w=majority
```
3. Replace `<password>` with your actual database password
4. The database name is `sankalp-ai` (it will be created automatically)

### Step 4: Create Database User
1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Create a username and password
4. Grant "Read and write to any database" permission

### Step 5: Whitelist IP Address
1. Go to "Network Access" in MongoDB Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. For production, add only your server's IP

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Server
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔐 Authentication Flow

### 1. User Registration
- User visits homepage
- Clicks "Login" button
- Selects role (Evaluator or Applicant)
- Clicks "Sign up here" link
- Fills registration form
- Backend creates user with hashed password
- JWT token returned and stored
- User redirected to role-specific dashboard

### 2. User Login
- User selects role from modal
- Enters email and password
- Backend verifies:
  - Email exists
  - Password is correct
  - Role matches account type
- JWT token returned and stored
- User redirected to dashboard

### 3. Protected Routes
- Every protected page checks for valid JWT token
- Backend verifies token on each request
- User role is checked for authorization
- Invalid/expired tokens redirect to home

## 🔑 JWT Token Structure

```javascript
{
  id: "user_id_from_mongodb",
  iat: "issued_at_timestamp",
  exp: "expiration_timestamp" // 30 days from issue
}
```

## 📋 API Endpoints

### Authentication Routes

#### Signup
```
POST /api/auth/signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "evaluator" // or "applicant"
}
Response: {
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "evaluator"
  }
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123",
  "role": "evaluator"
}
Response: {
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Verify Token
```
GET /api/auth/verify
Headers: {
  "Authorization": "Bearer jwt_token_here"
}
Response: {
  "success": true,
  "user": { ... }
}
```

## 🔒 Security Features

1. **Password Hashing**: Passwords hashed with bcryptjs (salt rounds: 12)
2. **JWT Tokens**: Expire after 30 days
3. **Role Verification**: Login checks if role matches account
4. **Protected Routes**: Frontend and backend route protection
5. **Token Storage**: LocalStorage (consider HttpOnly cookies for production)

## 📁 File Structure

```
frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication state management
│   ├── components/
│   │   ├── Navbar.jsx              # Updated with modal
│   │   ├── RoleSelectionModal.jsx  # Role selection UI
│   │   └── LandingPage.jsx         # Home page
│   ├── pages/
│   │   ├── EvaluatorLogin.jsx      # Evaluator login page
│   │   ├── ApplicantLogin.jsx      # Applicant login page
│   │   ├── EvaluatorSignup.jsx     # Evaluator signup page
│   │   ├── ApplicantSignup.jsx     # Applicant signup page
│   │   ├── EvaluatorDashboard.jsx  # Evaluator dashboard
│   │   └── ApplicantDashboard.jsx  # Applicant dashboard
│   └── App.jsx                     # Router configuration

backend/
├── models/
│   └── User.js                     # User schema with roles
├── controllers/
│   └── authController.js           # Auth logic
├── middleware/
│   └── authMiddleware.js           # JWT verification
├── routes/
│   └── authRoutes.js               # Auth endpoints
├── server.js                       # Main server file
└── .env                            # Environment variables
```

## 🎨 UI Features

- **Purple theme** for Evaluator pages
- **Blue theme** for Applicant pages
- **Responsive design** with Tailwind CSS
- **Animated modals** and transitions
- **Form validation** and error display
- **Loading states** for async operations

## 🔄 Next Steps (After MongoDB Setup)

1. **Add MongoDB connection string** to backend/.env
2. **Start backend server**: `cd backend && npm start`
3. **Start frontend server**: `cd frontend && npm run dev`
4. **Test registration**: Create an evaluator account
5. **Test login**: Login with created account
6. **Verify dashboard access**: Check role-based routing

## 🐛 Troubleshooting

### Backend won't start
- Make sure all dependencies are installed: `npm install`
- Check if MongoDB URI is correct in .env
- Verify port 5000 is not in use

### Frontend authentication fails
- Check if backend is running on port 5000
- Verify CORS is enabled in backend
- Check browser console for errors
- Clear localStorage if needed: `localStorage.clear()`

### MongoDB connection fails
- Verify connection string is correct
- Check database user credentials
- Ensure IP address is whitelisted
- Check network connectivity

## 📝 Important Notes

1. **Without MongoDB**: Backend will run but authentication won't work
2. **JWT Secret**: Change `JWT_SECRET` in production to a strong random string
3. **CORS**: Currently allows all origins (restrict in production)
4. **Token Storage**: LocalStorage is used (consider HttpOnly cookies for production)
5. **Password Requirements**: Minimum 6 characters (add more validation as needed)

## ✅ Testing Checklist

- [ ] Backend server starts successfully
- [ ] Frontend server starts successfully
- [ ] MongoDB connection successful
- [ ] Can register evaluator account
- [ ] Can register applicant account
- [ ] Can login as evaluator
- [ ] Can login as applicant
- [ ] Role modal appears on login click
- [ ] Dashboard shows correct role
- [ ] Logout works correctly
- [ ] Protected routes redirect properly
- [ ] Token persists after page refresh
