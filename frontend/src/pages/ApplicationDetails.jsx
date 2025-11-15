import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ApplicationDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setApplication(response.data.application);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError(err.response?.data?.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'under-review': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
          <button
            onClick={() => navigate('/applicant/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              Sankalp-AI
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/applicant/dashboard"
                className="px-6 py-2 rounded-lg font-semibold hover:bg-white hover:bg-opacity-20 transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/applicant/submit-application"
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Submit Application
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Application Details */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/applicant/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
              >
                <span>←</span> Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {application.projectTitle}
              </h1>
              <p className="text-gray-600">
                Application #{application.applicationNumber}
              </p>
            </div>
            <div>
              <span className={`px-6 py-3 rounded-lg text-lg font-bold ${getStatusColor(application.status)}`}>
                {application.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Institution Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Institution Name</p>
              <p className="text-lg font-semibold text-gray-800">{application.institutionName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">City</p>
              <p className="text-lg font-semibold text-gray-800">{application.city}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Address</p>
              <p className="text-lg font-semibold text-gray-800">{application.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">State</p>
              <p className="text-lg font-semibold text-gray-800">{application.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">PIN Code</p>
              <p className="text-lg font-semibold text-gray-800">{application.pinCode}</p>
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Project Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Project Title</p>
              <p className="text-lg font-semibold text-gray-800">{application.projectTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Domain</p>
              <p className="text-lg font-semibold text-gray-800">{application.domain}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Expected Budget</p>
              <p className="text-lg font-semibold text-gray-800">₹{application.expectedBudget}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Submitted Date</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Problem Statement</p>
              <p className="text-lg text-gray-800 leading-relaxed">{application.problemStatement}</p>
            </div>
          </div>
        </div>

        {/* Project Document Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Project Document
          </h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📄</div>
              <div>
                <p className="font-semibold text-gray-800">{application.pdfFileName}</p>
                <p className="text-sm text-gray-500">Project Detail PDF</p>
              </div>
            </div>
            <a
              href={application.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Open PDF
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
