import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Building2, MapPin, Home, Mail, CreditCard, Calendar, FileText, Download, ExternalLink, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';

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
      case 'approved': return 'bg-green-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      case 'under-review': return 'bg-blue-600 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      case 'under-review': return <Clock className="w-5 h-5" />;
      case 'pending': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error || 'Application not found'}</p>
          <button
            onClick={() => navigate('/applicant/dashboard')}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-red-600 text-white shadow-lg border-b-2 border-red-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={NationalEmblem} alt="National Emblem" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold text-white">Ministry of Coal</h1>
                <p className="text-xs text-red-100">Government of India</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/applicant/dashboard"
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/applicant/submit-application"
                className="bg-white text-red-600 px-6 py-2 rounded-xl font-semibold hover:bg-red-50 transition-all"
              >
                Submit Application
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-all"
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/applicant/dashboard')}
                className="text-red-600 hover:text-red-700 mb-4 flex items-center gap-2 font-semibold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {application.projectTitle}
              </h1>
              <p className="text-gray-600 text-lg">
                Application #{application.applicationNumber}
              </p>
            </div>
            <div>
              <span className={`px-6 py-3 rounded-xl text-base font-bold flex items-center gap-2 shadow-md ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                {application.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Institution Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Institution Name</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.institutionName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">City</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.city}</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Address</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.address}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">State</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.state}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">PIN Code</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.pinCode}</p>
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Project Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Project Title</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.projectTitle}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Domain</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.domain}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Expected Budget</p>
              </div>
              <p className="text-lg text-gray-900 pl-6 font-semibold">₹{application.expectedBudget}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Submitted Date</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">
                {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Problem Statement</p>
              </div>
              <p className="text-base text-gray-800 leading-relaxed pl-6 bg-gray-50 p-4 rounded-xl">{application.problemStatement}</p>
            </div>
          </div>
        </div>

        {/* Project Document Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Project Document
            </h2>
          </div>
          <div className="flex items-center justify-between p-6 bg-red-50 rounded-xl border-2 border-red-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{application.pdfFileName}</p>
                <p className="text-sm text-gray-600">Project Detail PDF Document</p>
              </div>
            </div>
            <a
              href={application.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:shadow-lg flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Open PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
