import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Loader2, PlusCircle, User, LogOut, Home, Send, Bell } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';

const ApplicantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchApplications();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching statistics with token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.get('http://localhost:5000/api/auth/statistics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Statistics response:', response.data);
      
      if (response.data.success) {
        console.log('Setting statistics:', response.data.statistics);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/applications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/applicant/application-updates"
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                View Application Updates
              </Link>
              <Link
                to="/applicant/submit-application"
                className="bg-white text-red-600 px-6 py-2 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Application
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-all flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user?.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                You are logged in as an <span className="font-semibold text-red-600">Applicant</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-600 mb-3">Total Applications</h3>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-10 h-10 animate-spin text-red-600" /> : statistics.totalApplications}
                </p>
              </div>
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-100 p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-600 mb-3">Pending</h3>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-10 h-10 animate-spin text-yellow-600" /> : statistics.pendingApplications}
                </p>
              </div>
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-600 mb-3">Approved</h3>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-10 h-10 animate-spin text-green-600" /> : statistics.approvedApplications}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">My Applications</h3>
          </div>
          
          {loadingApplications ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 text-lg mb-6">No applications submitted yet.</p>
              <Link
                to="/applicant/submit-application"
                className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Submit Your First Application
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Application Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Project Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-red-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {app.applicationNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {app.projectTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(app.status)}`}>
                          {app.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {app.status === 'under-review' && <Clock className="w-3 h-3" />}
                          {app.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/applicant/application/${app._id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all hover:shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
