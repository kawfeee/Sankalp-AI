import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const EvaluatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [latestApplications, setLatestApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestApplications();
  }, []);

  const fetchLatestApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/applications/all/list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Get only the latest 3 applications
        setLatestApplications(response.data.applications.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
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
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-linear-to-r from-purple-600 to-purple-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Evaluator Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome, {user?.name}! 👨‍💼
          </h2>
          <p className="text-gray-600 text-lg">
            You are logged in as an <span className="font-semibold text-purple-600">Evaluator</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Applications</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        {/* Latest Applications Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Latest Applications</h3>
            <button
              onClick={() => navigate('/evaluator/applications')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View All Applications
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : latestApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No applications available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestApplications.map((app) => (
                <div key={app._id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all hover:shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Application #</p>
                      <p className="text-lg font-bold text-gray-800">{app.applicationNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {app.projectTitle}
                  </h4>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Overall Score</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {app.overallScore !== null ? `${app.overallScore}/100` : 'Not Scored'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/evaluator/application/${app._id}`)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      View Application
                    </button>
                    <button
                      onClick={() => navigate(`/evaluator/scorecard/${app._id}`)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      View Score Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;
