import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ScoreCard = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock score data (will be replaced with real backend data)
  const [scoreData, setScoreData] = useState({
    finance: {
      financial_score: 8.5,
      commercialization_potential: 7.8,
      financial_risks: [
        "High initial capital requirements may limit scalability without funding",
        "Market volatility could impact revenue projections and ROI timeline",
        "Dependency on external investors increases financial vulnerability"
      ]
    },
    novelty: {
      novelty_score: 9.2,
      originality_score: 8.9,
      similar_sources: [
        "MIT Research Paper 2023",
        "Stanford Innovation Lab Study",
        "Google AI Patent 2022"
      ],
      analysis: [
        "Unique approach to solving existing problem with innovative methodology",
        "Combines multiple technologies in a novel way not seen before",
        "Strong potential for patent protection and IP development",
        "Addresses gap in current market solutions effectively",
        "Demonstrates clear advancement over existing technologies"
      ]
    },
    technical: {
      technical_score: 8.7,
      approach_clarity_score: 9.0,
      resource_availability_score: 7.5,
      timeline_feasibility_score: 8.2,
      technical_risks: [
        "Integration challenges with existing systems may cause delays",
        "Scalability issues could arise with increased user load",
        "Technical expertise required may be difficult to acquire"
      ]
    },
    relevance: {
      relevance_score: 9.5,
      industry_applicability_score: 9.2,
      ministry_alignment_score: 8.8,
      safety_environmental_impact_score: 9.0,
      psu_adoptability_score: 8.5
    }
  });

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
        // If backend has score data, update it here
        // if (response.data.application.scoreData) {
        //   setScoreData(response.data.application.scoreData);
        // }
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading score card...</p>
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
            onClick={() => navigate('/evaluator/dashboard')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
      <nav className="bg-linear-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              Sankalp-AI
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/evaluator/dashboard"
                className="px-6 py-2 rounded-lg font-semibold hover:bg-white hover:bg-opacity-20 transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/evaluator/applications"
                className="px-6 py-2 rounded-lg font-semibold hover:bg-white hover:bg-opacity-20 transition-all"
              >
                All Applications
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Score Card Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/evaluator/applications')}
                className="text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-2"
              >
                <span>←</span> Back to Applications
              </button>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Score Card
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Project Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Title</p>
                  <p className="text-lg font-semibold text-gray-800">{application.projectTitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Domain</p>
                    <p className="text-lg font-semibold text-gray-800">{application.domain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Expected Budget</p>
                    <p className="text-lg font-semibold text-gray-800">₹{application.expectedBudget}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Problem Statement</p>
                  <p className="text-base text-gray-800 leading-relaxed">{application.problemStatement}</p>
                </div>
              </div>
            </div>

            {/* Institution Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Institution Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Institution Name</p>
                  <p className="text-lg font-semibold text-gray-800">{application.institutionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">City</p>
                  <p className="text-lg font-semibold text-gray-800">{application.city}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-base text-gray-800">{application.address}</p>
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

            {/* Project Document */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Project Document
              </h2>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  Open PDF
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Scoring Panel */}
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2 opacity-90">Overall Score</h3>
              <p className="text-5xl font-bold mb-2">
                {application.overallScore !== null ? application.overallScore : '--'}
              </p>
              <p className="text-xl opacity-90">out of 100</p>
            </div>

            {/* Application Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                Application Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="text-base font-semibold text-gray-800">
                    {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Number</p>
                  <p className="text-base font-semibold text-gray-800">
                    {application.applicationNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(application.status).replace('text-white', 'text-gray-800').replace('bg-', 'bg-').replace('-500', '-100')}`}>
                    {application.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Evaluation Note */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Evaluation Note</p>
                  <p className="text-sm text-blue-800">
                    Review all application details and project documentation carefully before scoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
