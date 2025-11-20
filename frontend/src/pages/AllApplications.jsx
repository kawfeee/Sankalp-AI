import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Search, Filter, ArrowUpDown, ArrowLeft, TrendingUp, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, ClipboardList, Loader2, LogOut, Home, BarChart3, PieChart } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';
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
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all flex items-center gap-2"
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
        {/* Header with Back Button */}
        <button
          onClick={() => navigate('/evaluator/dashboard')}
          className="text-red-600 hover:text-red-700 mb-4 flex items-center gap-2 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Applications</h1>

        {/* SECTION 1: Search, Filter, and Sort Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 text-red-600" />
                Search
              </label>
              <input
                type="text"
                placeholder="Application # or Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-4 h-4 text-red-600" />
                Status Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BarChart3 className="w-4 h-4 text-red-600" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <ArrowUpDown className="w-4 h-4 text-red-600" />
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Benchmarks Dashboard */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Benchmarks</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Highest Overall Score Card - Centered */}
            <div className="bg-red-600 text-white rounded-2xl shadow-lg border-2 border-red-700 p-8 flex flex-col items-center justify-center">
              <p className="text-red-100 text-sm font-semibold mb-3">Highest Overall Score</p>
              <p className="text-7xl font-bold">{benchmarks.highestOverallScore}</p>
              <p className="text-red-100 text-base mt-3 font-medium">out of 10</p>
            </div>

            {/* Bar Graph - Highest Scores by Category - Chart.js */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-gray-900">Highest Scores by Category</h3>
              </div>
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
                        'rgba(220, 38, 38, 0.8)',    // Red
                        'rgba(249, 115, 22, 0.8)',   // Orange
                        'rgba(34, 197, 94, 0.8)',    // Green
                        'rgba(234, 179, 8, 0.8)'     // Yellow
                      ],
                      borderColor: [
                        'rgb(220, 38, 38)',
                        'rgb(249, 115, 22)',
                        'rgb(34, 197, 94)',
                        'rgb(234, 179, 8)'
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-2 justify-center mb-4">
                <PieChart className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-gray-900">Proposals Overview</h3>
              </div>
              <div className="flex items-center justify-between gap-4">
                {/* Pie Chart */}
                <div className="shrink-0">
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
                    <div className="w-3 h-3 bg-green-500 rounded-full shrink-0"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-gray-700">Approved</span>
                      <span className="text-sm font-bold text-gray-800">{benchmarks.totalApproved}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full shrink-0"></div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-gray-700">Rejected</span>
                      <span className="text-sm font-bold text-gray-800">{benchmarks.totalRejected}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full shrink-0"></div>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">R&D Proposals</h2>
            </div>
            <p className="text-gray-600">
              Showing <span className="font-bold text-red-600">{filteredApplications.length}</span> of {applications.length} applications
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-gray-600 text-lg">No applications found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="bg-red-50 rounded-xl shadow-sm p-4 hidden md:grid md:grid-cols-6 gap-4 font-bold text-gray-700 text-xs uppercase tracking-wider border border-red-100">
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
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:border-red-200 transition-all p-4 md:grid md:grid-cols-6 md:gap-3 md:items-center border border-gray-100"
                  >
                    {/* Application Number */}
                    <div className="mb-2 md:mb-0">
                      <p className="text-xs text-gray-500 md:hidden mb-1 font-semibold">Application Number</p>
                      <p className="font-bold text-gray-900 text-sm">{app.applicationNumber}</p>
                    </div>

                    {/* Project Title */}
                    <div className="mb-2 md:mb-0">
                      <p className="text-xs text-gray-500 md:hidden mb-1 font-semibold">Project Title</p>
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{app.projectTitle}</p>
                    </div>

                    {/* Overall Score */}
                    <div className="mb-2 md:mb-0 md:flex md:justify-center">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 md:hidden mb-1 font-semibold">Overall Score</p>
                        <p className="text-lg font-bold text-red-600">
                          {scorecard?.overall_score ? scorecard.overall_score.toFixed(1) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-2 md:mb-0 md:flex md:justify-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {app.status === 'under-review' && <Clock className="w-3 h-3" />}
                        {app.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Submitted Date */}
                    <div className="mb-2 md:mb-0 md:text-center">
                      <p className="text-xs text-gray-500 md:hidden mb-1 font-semibold">Submitted Date</p>
                      <p className="text-xs text-gray-700 font-medium">
                        {new Date(app.submittedAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    {/* Action - Two Buttons */}
                    <div className="flex flex-col gap-2 md:flex-row md:justify-center md:flex-wrap">
                      <button
                        onClick={() => navigate(`/evaluator/application/${app._id}`)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-all hover:shadow-md whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" />
                        View Application
                      </button>
                      <button
                        onClick={() => navigate(`/evaluator/scorecard/${app._id}`)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-all hover:shadow-md whitespace-nowrap"
                      >
                        <ClipboardList className="w-3 h-3" />
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
