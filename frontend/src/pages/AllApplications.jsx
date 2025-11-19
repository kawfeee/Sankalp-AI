import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AllApplications = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('submission_time');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = latest first

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch applications
      const appsResponse = await axios.get('http://localhost:5000/api/applications/all/list', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch all scorecards
      const scoresResponse = await axios.get('http://localhost:5000/api/scorecard/all/list', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (appsResponse.data.success) {
        setApplications(appsResponse.data.applications);
      }
      
      if (scoresResponse.data.success) {
        setScorecards(scoresResponse.data.scorecards);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // Get score for an application
  const getScore = (appNumber) => {
    const scorecard = scorecards.find(sc => sc.application_number === appNumber);
    return scorecard || null;
  };

  // Calculate benchmarks
  const calculateBenchmarks = () => {
    const validScores = scorecards.filter(sc => sc.overall_score != null);
    
    if (validScores.length === 0) {
      return {
        highestOverallScore: 0,
        highestFinance: 0,
        highestTechnical: 0,
        highestRelevance: 0,
        highestNovelty: 0,
        totalApproved: applications.filter(a => a.status === 'approved').length,
        totalRejected: applications.filter(a => a.status === 'rejected').length,
        totalPending: applications.filter(a => a.status === 'pending').length
      };
    }

    const highestOverallScore = Math.max(...validScores.map(sc => sc.overall_score || 0));
    const highestFinance = Math.max(...validScores.map(sc => sc.finance_score?.financial_score || 0));
    const highestTechnical = Math.max(...validScores.map(sc => sc.technical_score?.technical_score || 0));
    const highestRelevance = Math.max(...validScores.map(sc => sc.relevance_score?.relevance_score || 0));
    const highestNovelty = Math.max(...validScores.map(sc => sc.novelty_score?.novelty_score || 0));

    return {
      highestOverallScore: highestOverallScore.toFixed(1),
      highestFinance: highestFinance.toFixed(1),
      highestTechnical: highestTechnical.toFixed(1),
      highestRelevance: highestRelevance.toFixed(1),
      highestNovelty: highestNovelty.toFixed(1),
      totalApproved: applications.filter(a => a.status === 'approved').length,
      totalRejected: applications.filter(a => a.status === 'rejected').length,
      totalPending: applications.filter(a => a.status === 'pending').length
    };
  };

  const benchmarks = calculateBenchmarks();

  // Filter, search, and sort applications
  const getFilteredAndSortedApplications = () => {
    let filtered = applications;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(app => app.status === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicationNumber.toLowerCase().includes(query) ||
        app.projectTitle.toLowerCase().includes(query) ||
        app.institutionName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const scoreA = getScore(a.applicationNumber);
      const scoreB = getScore(b.applicationNumber);

      switch(sortBy) {
        case 'overall_score':
          const overallA = scoreA?.overall_score || 0;
          const overallB = scoreB?.overall_score || 0;
          return sortOrder === 'asc' ? overallA - overallB : overallB - overallA;
        
        case 'finance_score':
          const financeA = scoreA?.finance_score?.financial_score || 0;
          const financeB = scoreB?.finance_score?.financial_score || 0;
          return sortOrder === 'asc' ? financeA - financeB : financeB - financeA;
        
        case 'technical_score':
          const technicalA = scoreA?.technical_score?.technical_score || 0;
          const technicalB = scoreB?.technical_score?.technical_score || 0;
          return sortOrder === 'asc' ? technicalA - technicalB : technicalB - technicalA;
        
        case 'relevance_score':
          const relevanceA = scoreA?.relevance_score?.relevance_score || 0;
          const relevanceB = scoreB?.relevance_score?.relevance_score || 0;
          return sortOrder === 'asc' ? relevanceA - relevanceB : relevanceB - relevanceA;
        
        case 'novelty_score':
          const noveltyA = scoreA?.novelty_score?.novelty_score || 0;
          const noveltyB = scoreB?.novelty_score?.novelty_score || 0;
          return sortOrder === 'asc' ? noveltyA - noveltyB : noveltyB - noveltyA;
        
        case 'submission_time':
        default:
          const dateA = new Date(a.submittedAt);
          const dateB = new Date(b.submittedAt);
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    return sorted;
  };

  const filteredApplications = getFilteredAndSortedApplications();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate('/evaluator/dashboard')}
          className="text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-2 font-semibold"
        >
          <span>←</span> Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-gray-800 mb-8">All Applications</h1>

        {/* SECTION 1: Search, Filter, and Sort Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search
              </label>
              <input
                type="text"
                placeholder="Application # or Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Status Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under-review">Under Review</option>
              </select>
            </div>

            {/* Sort By Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="submission_time">Submission Time</option>
                <option value="overall_score">Overall Score</option>
                <option value="finance_score">Finance Score</option>
                <option value="novelty_score">Novelty Score</option>
                <option value="technical_score">Technical Score</option>
                <option value="relevance_score">Relevance Score</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⬆️⬇️ Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Benchmarks Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Benchmarks</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Highest Overall Score Card - Centered */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
              <p className="text-purple-100 text-sm font-medium mb-3">Highest Overall Score</p>
              <p className="text-7xl font-bold">{benchmarks.highestOverallScore}</p>
              <p className="text-purple-100 text-base mt-3">out of 10</p>
            </div>

            {/* Bar Graph - Highest Scores by Category - Chart.js */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4 text-center">Highest Scores by Category</h3>
              <div className="h-48">
                <Bar
                  data={{
                    labels: ['💰 Finance', '💡 Novelty', '🔧 Technical', '🎯 Relevance'],
                    datasets: [{
                      label: 'Score',
                      data: [
                        parseFloat(benchmarks.highestFinance),
                        parseFloat(benchmarks.highestNovelty),
                        parseFloat(benchmarks.highestTechnical),
                        parseFloat(benchmarks.highestRelevance)
                      ],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',   // Blue
                        'rgba(139, 92, 246, 0.8)',   // Purple
                        'rgba(16, 185, 129, 0.8)',   // Green
                        'rgba(245, 158, 11, 0.8)'    // Orange
                      ],
                      borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(139, 92, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)'
                      ],
                      borderWidth: 2,
                      borderRadius: 6
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                          stepSize: 2,
                          font: {
                            size: 11
                          }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: 12
                          }
                        },
                        grid: {
                          display: false
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                          size: 13
                        },
                        bodyFont: {
                          size: 12
                        },
                        callbacks: {
                          label: function(context) {
                            return 'Score: ' + context.parsed.y.toFixed(1) + '/10';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Pie Chart - Status Distribution with Side Legend */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4 text-center">Proposals Overview</h3>
              <div className="flex items-center justify-between gap-4">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                  <svg viewBox="0 0 200 200" className="w-32 h-32">
                    {(() => {
                      const total = benchmarks.totalApproved + benchmarks.totalRejected + benchmarks.totalPending;
                      if (total === 0) return null;

                      const approved = (benchmarks.totalApproved / total) * 360;
                      const rejected = (benchmarks.totalRejected / total) * 360;
                      const pending = (benchmarks.totalPending / total) * 360;

                      return (
                        <>
                          <circle cx="100" cy="100" r="60" fill="transparent" stroke="#10B981" strokeWidth="40" 
                            strokeDasharray={`${(approved / 360) * 377} 377`} strokeDashoffset="0" transform="rotate(-90 100 100)" />
                          <circle cx="100" cy="100" r="60" fill="transparent" stroke="#EF4444" strokeWidth="40" 
                            strokeDasharray={`${(rejected / 360) * 377} 377`} strokeDashoffset={-((approved / 360) * 377)} transform="rotate(-90 100 100)" />
                          <circle cx="100" cy="100" r="60" fill="transparent" stroke="#F59E0B" strokeWidth="40" 
                            strokeDasharray={`${(pending / 360) * 377} 377`} strokeDashoffset={-(((approved + rejected) / 360) * 377)} transform="rotate(-90 100 100)" />
                        </>
                      );
                    })()}
                  </svg>
                </div>
                
                {/* Legend on Right */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-gray-700">Approved</span>
                      <span className="text-sm font-bold text-gray-800">{benchmarks.totalApproved}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-gray-700">Rejected</span>
                      <span className="text-sm font-bold text-gray-800">{benchmarks.totalRejected}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-gray-700">Pending</span>
                      <span className="text-sm font-bold text-gray-800">{benchmarks.totalPending}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Applications List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">R&D Proposals</h2>
            <p className="text-gray-600">
              Showing <span className="font-bold text-purple-600">{filteredApplications.length}</span> of {applications.length} applications
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No applications found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="bg-white rounded-lg shadow-md p-4 hidden md:grid md:grid-cols-6 gap-4 font-semibold text-gray-700 text-sm">
                <div>APPLICATION NUMBER</div>
                <div>PROJECT TITLE</div>
                <div className="text-center">OVERALL SCORE</div>
                <div className="text-center">STATUS</div>
                <div className="text-center">SUBMITTED DATE</div>
                <div className="text-center">ACTION</div>
              </div>

              {/* Application Cards/Rows */}
              {filteredApplications.map((app) => {
                const scorecard = getScore(app.applicationNumber);
                return (
                  <div 
                    key={app._id} 
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-4 md:grid md:grid-cols-6 md:gap-3 md:items-center"
                  >
                    {/* Application Number */}
                    <div className="mb-2 md:mb-0">
                      <p className="text-xs text-gray-500 md:hidden mb-1">Application Number</p>
                      <p className="font-bold text-gray-800 text-sm">{app.applicationNumber}</p>
                    </div>

                    {/* Project Title */}
                    <div className="mb-2 md:mb-0">
                      <p className="text-xs text-gray-500 md:hidden mb-1">Project Title</p>
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1">{app.projectTitle}</p>
                    </div>

                    {/* Overall Score */}
                    <div className="mb-2 md:mb-0 md:flex md:justify-center">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 md:hidden mb-1">Overall Score</p>
                        <p className="text-base font-bold text-purple-600">
                          {scorecard?.overall_score ? scorecard.overall_score.toFixed(1) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-2 md:mb-0 md:flex md:justify-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Submitted Date */}
                    <div className="mb-2 md:mb-0 md:text-center">
                      <p className="text-xs text-gray-500 md:hidden mb-1">Submitted Date</p>
                      <p className="text-xs text-gray-700">
                        {new Date(app.submittedAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    {/* Action - Two Buttons */}
                    <div className="flex flex-col gap-1.5 md:flex-row md:justify-center md:flex-wrap">
                      <button
                        onClick={() => navigate(`/evaluator/application/${app._id}`)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        View Application
                      </button>
                      <button
                        onClick={() => navigate(`/evaluator/scorecard/${app._id}`)}
                        className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap"
                      >
                        View Score Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllApplications;
