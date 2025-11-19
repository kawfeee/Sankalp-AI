import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import HomePage from './pages/HomePage'
import EvaluatorLogin from './pages/EvaluatorLogin'
import ApplicantLogin from './pages/ApplicantLogin'
import EvaluatorSignup from './pages/EvaluatorSignup'
import ApplicantSignup from './pages/ApplicantSignup'
import EvaluatorDashboard from './pages/EvaluatorDashboard'
import ApplicantDashboard from './pages/ApplicantDashboard'
import SubmitApplication from './pages/SubmitApplication'
import ApplicationDetails from './pages/ApplicationDetails'
import AllApplications from './pages/AllApplications'
import ScoreCard from './pages/ScoreCard'
import EvaluatorApplicationDetails from './pages/EvaluatorApplicationDetails'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home wrapper with Navbar
const Home = () => (
  <>
    <Navbar />
    <LandingPage />
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="w-full min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login/evaluator" element={<EvaluatorLogin />} />
            <Route path="/login/applicant" element={<ApplicantLogin />} />
            <Route path="/signup/evaluator" element={<EvaluatorSignup />} />
            <Route path="/signup/applicant" element={<ApplicantSignup />} />
            
            <Route 
              path="/evaluator/dashboard" 
              element={
                <ProtectedRoute allowedRole="evaluator">
                  <EvaluatorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/evaluator/applications" 
              element={
                <ProtectedRoute allowedRole="evaluator">
                  <AllApplications />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/evaluator/application/:id" 
              element={
                <ProtectedRoute allowedRole="evaluator">
                  <EvaluatorApplicationDetails />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/evaluator/scorecard/:id" 
              element={
                <ProtectedRoute allowedRole="evaluator">
                  <ScoreCard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/applicant/dashboard" 
              element={
                <ProtectedRoute allowedRole="applicant">
                  <ApplicantDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/applicant/submit-application" 
              element={
                <ProtectedRoute allowedRole="applicant">
                  <SubmitApplication />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/applicant/application/:id" 
              element={
                <ProtectedRoute allowedRole="applicant">
                  <ApplicationDetails />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
