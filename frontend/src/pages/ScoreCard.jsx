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

  const calculateOverallScore = () => {
    const total = scoreData.finance.financial_score + 
                  scoreData.novelty.novelty_score + 
                  scoreData.technical.technical_score + 
                  scoreData.relevance.relevance_score;
    return (total / 4).toFixed(1);
  };

  const pieData = [
    { name: 'Finance', value: scoreData.finance.financial_score, color: '#3B82F6' },
    { name: 'Novelty', value: scoreData.novelty.novelty_score, color: '#8B5CF6' },
    { name: 'Technical', value: scoreData.technical.technical_score, color: '#10B981' },
    { name: 'Relevance', value: scoreData.relevance.relevance_score, color: '#F59E0B' }
  ];

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
        {/* Back Button */}
        <button
          onClick={() => navigate('/evaluator/applications')}
          className="text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-2 font-semibold"
        >
          <span>←</span> Back to Applications
        </button>

        {/* Top Card - Title, Institution, Overall Score with Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {application.projectTitle}
              </h1>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="text-xl font-semibold text-gray-800">{application.institutionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Number</p>
                  <p className="text-lg font-semibold text-gray-800">{application.applicationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overall Score</p>
                  <p className="text-5xl font-bold text-purple-600 mt-2">{calculateOverallScore()}/10</p>
                </div>
              </div>
            </div>

            {/* Right Side - Pie Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <svg viewBox="0 0 200 200" className="w-full h-auto">
                  {/* Simple Pie Chart using circles */}
                  {pieData.map((item, index) => {
                    const total = pieData.reduce((sum, d) => sum + d.value, 0);
                    const percentage = (item.value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = pieData.slice(0, index).reduce((sum, d) => {
                      return sum + ((d.value / total) * 360);
                    }, 0);
                    
                    return (
                      <g key={index}>
                        <circle
                          cx="100"
                          cy="100"
                          r="60"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="40"
                          strokeDasharray={`${(angle / 360) * 377} 377`}
                          strokeDashoffset={-((startAngle / 360) * 377)}
                          transform="rotate(-90 100 100)"
                        />
                      </g>
                    );
                  })}
                </svg>
                
                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}: {item.value}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1 - Finance Score */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">💰</span>
              Finance Score
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Financial Score</p>
                  <p className="text-3xl font-bold text-blue-600">{scoreData.finance.financial_score}/10</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Commercialization</p>
                  <p className="text-3xl font-bold text-blue-600">{scoreData.finance.commercialization_potential}/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Financial Risks:</p>
                <ul className="space-y-2">
                  {scoreData.finance.financial_risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 2 - Novelty Score */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">💡</span>
              Novelty Score
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Novelty Score</p>
                  <p className="text-3xl font-bold text-purple-600">{scoreData.novelty.novelty_score}/10</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Originality</p>
                  <p className="text-3xl font-bold text-purple-600">{scoreData.novelty.originality_score}/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Similar Sources:</p>
                <ul className="space-y-1">
                  {scoreData.novelty.similar_sources.map((source, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="text-purple-500">📚</span>
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Analysis:</p>
                <ul className="space-y-2">
                  {scoreData.novelty.analysis.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 3 - Technical Score */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🔧</span>
              Technical Score
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Technical Score</p>
                  <p className="text-3xl font-bold text-green-600">{scoreData.technical.technical_score}/10</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Approach Clarity</p>
                  <p className="text-3xl font-bold text-green-600">{scoreData.technical.approach_clarity_score}/10</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Resource Availability</p>
                  <p className="text-2xl font-bold text-green-600">{scoreData.technical.resource_availability_score}/10</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Timeline Feasibility</p>
                  <p className="text-2xl font-bold text-green-600">{scoreData.technical.timeline_feasibility_score}/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Technical Risks:</p>
                <ul className="space-y-2">
                  {scoreData.technical.technical_risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠️</span>
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 4 - Relevance Score */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              Relevance Score
            </h2>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overall Relevance Score</p>
                <p className="text-4xl font-bold text-orange-600">{scoreData.relevance.relevance_score}/10</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Industry Applicability</p>
                  <p className="text-2xl font-bold text-orange-600">{scoreData.relevance.industry_applicability_score}/10</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Ministry Alignment</p>
                  <p className="text-2xl font-bold text-orange-600">{scoreData.relevance.ministry_alignment_score}/10</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Safety & Environmental</p>
                  <p className="text-2xl font-bold text-orange-600">{scoreData.relevance.safety_environmental_impact_score}/10</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">PSU Adoptability</p>
                  <p className="text-2xl font-bold text-orange-600">{scoreData.relevance.psu_adoptability_score}/10</p>
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
