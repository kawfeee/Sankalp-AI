import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, AlertCircle, Loader2, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ApplicantLogin = () => {
  const [step, setStep] = useState('LOGIN'); // 'LOGIN' or 'VERIFY_OTP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role: 'applicant'
      });

      // Check if user is whitelisted and got token directly
      if (response.data.success && response.data.token) {
        // Whitelisted user - direct login
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setToken(response.data.token);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/applicant/dashboard');
        }, 1000);
      } else if (response.data.success && response.data.nextStep === 'VERIFY_OTP') {
        // Regular user - OTP required
        setSuccess('OTP sent to your email! Please check your inbox.');
        setStep('VERIFY_OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });

      if (response.data.success && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set token in auth context
        setToken(response.data.token);
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/applicant/dashboard');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Applicant Portal</h2>
          <p className="text-gray-600 text-sm">Submit and track your research proposals</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Conditional Form Rendering */}
        {step === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="researcher@university.edu"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Enter your secure password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying credentials...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Send OTP
              </>
            )}
          </button>
        </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Email Verification Required</p>
                <p>A 4-digit OTP has been sent to <strong>{email}</strong>. Please enter it below to complete your login.</p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-bold tracking-widest text-gray-900"
                placeholder="0000"
                maxLength="4"
                required
              />
              <p className="text-xs text-gray-500 text-center">OTP expires in 5 minutes</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify & Login
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('LOGIN');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-semibold text-sm transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Footer Links */}
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              New to the platform?{' '}
              <Link to="/signup/applicant" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          <div className="text-center border-t border-gray-100 pt-4">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>

      {/* Ministry Badge */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span>Ministry of Coal | Govt. of India</span>
        </div>
      </div>
    </div>
  );
};

export default ApplicantLogin;
