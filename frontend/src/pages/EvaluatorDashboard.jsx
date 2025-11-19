import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, ClipboardList, Loader2, LogOut, Home, List } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';

const EvaluatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [latestApplications, setLatestApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    pendingReviews: 0,
    completed: 0
  });

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
        const allApplications = response.data.applications;
        
        // Calculate statistics
        const totalApplications = allApplications.length;
        const pendingReviews = allApplications.filter(
          app => app.status === 'pending' || app.status === 'under-review'
        ).length;
        const completed = allApplications.filter(
          app => app.status === 'approved' || app.status === 'rejected'
        ).length;
        
        setStatistics({
          totalApplications,
          pendingReviews,
          completed
        });
        
        // Get only the latest 3 applications
        setLatestApplications(allApplications.slice(0, 3));
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
    <div className="min-h-screen bg-gray-50">
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
                to="/evaluator/dashboard"
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Dashboard
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
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user?.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                You are logged in as an <span className="font-semibold text-red-600">Evaluator</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-8 transform hover:scale-105 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-600 mb-3">Applications</h3>
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
                <h3 className="text-base font-semibold text-gray-600 mb-3">Pending Reviews</h3>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-10 h-10 animate-spin text-yellow-600" /> : statistics.pendingReviews}
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
                <h3 className="text-base font-semibold text-gray-600 mb-3">Completed</h3>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-10 h-10 animate-spin text-green-600" /> : statistics.completed}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Latest Applications Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Latest Applications</h3>
            </div>
            <button
              onClick={() => navigate('/evaluator/applications')}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:shadow-lg flex items-center gap-2"
            >
              <List className="w-5 h-5" />
              View All Applications
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          ) : latestApplications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 text-lg">No applications available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestApplications.map((app) => (
                <div key={app._id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-red-300 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-500">Application #</p>
                        <p className="text-base font-bold text-gray-900">{app.applicationNumber}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(app.status)}`}>
                      {app.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {app.status === 'under-review' && <Clock className="w-3 h-3" />}
                      {app.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 min-h-14">
                    {app.projectTitle}
                  </h4>
                  
                  <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Overall Score</p>
                    <p className="text-3xl font-bold text-red-600">
                      {app.overallScore !== null ? `${app.overallScore}/100` : 'Not Scored'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/evaluator/application/${app._id}`)}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Application
                    </button>
                    <button
                      onClick={() => navigate(`/evaluator/scorecard/${app._id}`)}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
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
