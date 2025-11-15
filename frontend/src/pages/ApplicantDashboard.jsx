import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome, {user?.name}! 👤
          </h2>
          <p className="text-gray-600 text-lg">
            You are logged in as an <span className="font-semibold text-blue-600">Applicant</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 opacity-90">Total Applications</h3>
                <p className="text-4xl font-bold">
                  {loading ? '...' : statistics.totalApplications}
                </p>
              </div>
              <div className="text-5xl opacity-20">📄</div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 opacity-90">Pending</h3>
                <p className="text-4xl font-bold">
                  {loading ? '...' : statistics.pendingApplications}
                </p>
              </div>
              <div className="text-5xl opacity-20">⏳</div>
            </div>
          </div>
          
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 opacity-90">Approved</h3>
                <p className="text-4xl font-bold">
                  {loading ? '...' : statistics.approvedApplications}
                </p>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h3>
          
          {loadingApplications ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No applications submitted yet.</p>
              <Link
                to="/applicant/submit-application"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Your First Application
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.applicationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.projectTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/applicant/application/${app._id}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                        >
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
