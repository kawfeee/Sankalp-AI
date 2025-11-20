import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, Home, LogOut, FileText, MessageSquare, User as UserIcon,
  Calendar, Building2, Loader2, AlertCircle, CheckCircle, XCircle, Clock
} from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';

const EvaluatorRemarks = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [scoreCard, setScoreCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationAndScoreCard();
  }, [id]);

  const fetchApplicationAndScoreCard = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch application details
      const appResponse = await axios.get(`http://localhost:5000/api/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (appResponse.data.success) {
        setApplication(appResponse.data.application);
        
        // Fetch scorecard if available
        try {
          const scoreResponse = await axios.get(
            `http://localhost:5000/api/scorecard/${appResponse.data.application.applicationNumber}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (scoreResponse.data.success) {
            setScoreCard(scoreResponse.data.scoreCard);
          }
        } catch (scoreError) {
          console.log('No scorecard available yet');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
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
          <p className="mt-4 text-gray-600 font-medium">Loading remarks...</p>
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
            onClick={() => navigate('/applicant/application-updates')}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Updates
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
              <button
                onClick={() => navigate('/applicant/application-updates')}
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <Link
                to="/applicant/dashboard"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Evaluator Remarks</h2>
                <p className="text-gray-600 text-lg mt-1">
                  Feedback and Comments
                </p>
              </div>
            </div>
            <span className={`px-6 py-3 rounded-xl font-semibold text-base flex items-center gap-2 ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              {application.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Application Number</p>
                <p className="font-semibold text-gray-900">{application.applicationNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Institution</p>
                <p className="font-semibold text-gray-900">{application.institutionName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="font-semibold text-gray-900">
                  {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Title */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Project Title</h3>
          <p className="text-2xl font-bold text-gray-900">{application.projectTitle}</p>
        </div>

        {/* Evaluation Remarks */}
        {scoreCard ? (
          <div className="space-y-6">
            {/* Financial Remarks */}
            {scoreCard.finance?.financial_risks && scoreCard.finance.financial_risks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Financial Assessment</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-red-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">Financial Score</p>
                      <p className="text-2xl font-bold text-red-600">{scoreCard.finance.financial_score}/10</p>
                    </div>
                    <div className="bg-red-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">Commercialization</p>
                      <p className="text-2xl font-bold text-red-600">{scoreCard.finance.commercialization_potential}/10</p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Risk Factors:</h4>
                  <ul className="space-y-2">
                    {scoreCard.finance.financial_risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Technical Remarks */}
            {scoreCard.technical?.technical_risks && scoreCard.technical.technical_risks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Technical Assessment</h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Technical Score</p>
                      <p className="text-xl font-bold text-green-600">{scoreCard.technical.technical_score}/10</p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Approach Clarity</p>
                      <p className="text-xl font-bold text-green-600">{scoreCard.technical.approach_clarity_score}/10</p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Resources</p>
                      <p className="text-xl font-bold text-green-600">{scoreCard.technical.resource_availability_score}/10</p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-600">Timeline</p>
                      <p className="text-xl font-bold text-green-600">{scoreCard.technical.timeline_feasibility_score}/10</p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Technical Concerns:</h4>
                  <ul className="space-y-2">
                    {scoreCard.technical.technical_risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Novelty Assessment */}
            {scoreCard.novelty && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Novelty Assessment</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">Novelty Score</p>
                      <p className="text-2xl font-bold text-orange-600">{Number(scoreCard.novelty.novelty_score).toFixed(1)}/10</p>
                    </div>
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">Proposals Checked</p>
                      <p className="text-2xl font-bold text-orange-600">{scoreCard.novelty.total_proposals_checked}</p>
                    </div>
                  </div>
                  {scoreCard.novelty.similar_proposals && scoreCard.novelty.similar_proposals.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Similar Proposals Found:</h4>
                      <div className="overflow-x-auto rounded-xl border border-orange-200">
                        <table className="w-full text-sm">
                          <thead className="bg-orange-50">
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Application Number</th>
                              <th className="text-right py-3 px-4 text-gray-700 font-semibold">Similarity %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scoreCard.novelty.similar_proposals.map((proposal, index) => (
                              <tr key={index} className="border-b hover:bg-orange-50 transition-colors">
                                <td className="py-3 px-4 text-gray-700">{proposal.application_number}</td>
                                <td className="py-3 px-4 text-right text-orange-600 font-semibold">{proposal.similarity_percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Relevance Assessment */}
            {scoreCard.relevance && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-100 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Relevance Assessment</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-yellow-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-gray-600">Overall Relevance</p>
                    <p className="text-2xl font-bold text-yellow-600">{scoreCard.relevance.relevance_score}/10</p>
                  </div>
                  <div className="bg-yellow-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-gray-600">Industry Applicability</p>
                    <p className="text-2xl font-bold text-yellow-600">{scoreCard.relevance.industry_applicability_score}/10</p>
                  </div>
                  <div className="bg-yellow-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-gray-600">Ministry Alignment</p>
                    <p className="text-2xl font-bold text-yellow-600">{scoreCard.relevance.ministry_alignment_score}/10</p>
                  </div>
                  <div className="bg-yellow-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-gray-600">Safety & Environmental</p>
                    <p className="text-2xl font-bold text-yellow-600">{scoreCard.relevance.safety_environmental_impact_score}/10</p>
                  </div>
                  <div className="bg-yellow-50 px-4 py-3 rounded-lg">
                    <p className="text-xs text-gray-600">PSU Adoptability</p>
                    <p className="text-2xl font-bold text-yellow-600">{scoreCard.relevance.psu_adoptability_score}/10</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Remarks Available</h3>
            <p className="text-gray-600">
              The application has not been evaluated yet. Remarks will appear here once the evaluation is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluatorRemarks;
