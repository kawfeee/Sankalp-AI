import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ArrowLeft, Home, LogOut, FileText, Eye, Download, RefreshCw, 
  PlusCircle, Loader2, AlertCircle, CheckCircle, XCircle, Clock,
  Bell, ChevronDown, ChevronUp
} from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';
import { ProgressBar, Step } from 'react-step-progress-bar';
import 'react-step-progress-bar/styles.css';

const ApplicationUpdates = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [reEvaluating, setReEvaluating] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

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
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getProgressPercentage = (status) => {
    switch(status) {
      case 'pending': return 33.33;
      case 'under-review': return 66.66;
      case 'approved': return 100;
      case 'rejected': return 100;
      default: return 0;
    }
  };

  const getProgressStep = (status) => {
    switch(status) {
      case 'pending': return 1;
      case 'under-review': return 2;
      case 'approved': return 3;
      case 'rejected': return 3;
      default: return 0;
    }
  };

  const handleRequestReEvaluation = async (applicationId) => {
    if (!confirm('Are you sure you want to request re-evaluation? This will change your application status to Pending and update the submission date.')) {
      return;
    }

    setReEvaluating(applicationId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/applications/${applicationId}/re-evaluate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Re-evaluation request submitted successfully!');
        fetchApplications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error requesting re-evaluation:', error);
      alert(error.response?.data?.message || 'Failed to submit re-evaluation request');
    } finally {
      setReEvaluating(null);
    }
  };

  const handleDownloadScoreCard = async (app) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch the actual scorecard data from database
      const scoreResponse = await axios.get(
        `http://localhost:5000/api/scorecard/${app.applicationNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      let scoreData;
      if (scoreResponse.data.success && scoreResponse.data.scoreCard) {
        // Use real scorecard data from database
        scoreData = scoreResponse.data.scoreCard;
      } else {
        // Default values if no scorecard exists yet
        scoreData = {
          finance: {
            financial_score: 0,
            commercialization_potential: 0,
            financial_risks: ['Evaluation pending']
          },
          novelty: {
            novelty_score: 0,
            total_proposals_checked: 0,
            similar_proposals: []
          },
          technical: {
            technical_score: 0,
            approach_clarity_score: 0,
            resource_availability_score: 0,
            timeline_feasibility_score: 0,
            technical_risks: ['Evaluation pending']
          },
          relevance: {
            relevance_score: 0,
            industry_applicability_score: 0,
            ministry_alignment_score: 0,
            safety_environmental_impact_score: 0,
            psu_adoptability_score: 0
          }
        };
      }

      // Calculate overall score
      const calculateOverallScore = () => {
        const financeScore = Number(scoreData.finance?.financial_score || 0);
        const noveltyScore = Number(scoreData.novelty?.novelty_score || 0);
        const technicalScore = Number(scoreData.technical?.technical_score || 0);
        const relevanceScore = Number(scoreData.relevance?.relevance_score || 0);
        return (financeScore + noveltyScore + technicalScore + relevanceScore).toFixed(1);
      };

      // Generate PDF - EXACT same as evaluator
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;
      
      const checkSpace = (needed = 15) => {
        if (currentY + needed > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
      };
      
      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(139, 92, 246);
      pdf.text('SCORE CARD REPORT', pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;
      
      // Application Details
      checkSpace(50);
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Application Details', 15, currentY);
      currentY += 10;
      
      autoTable(pdf, {
        startY: currentY,
        head: [['Field', 'Value']],
        body: [
          ['Application Number', app.applicationNumber],
          ['Project Title', app.projectTitle],
          ['Institution', app.institutionName],
          ['Status', app.status.toUpperCase()],
          ['Submitted Date', new Date(app.submittedAt).toLocaleDateString('en-GB')],
          ['Overall Score', `${calculateOverallScore()}/10`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 15, right: 15 }
      });
      currentY = pdf.lastAutoTable.finalY + 15;

      // Finance Score Section
      checkSpace(30);
      pdf.setFontSize(16);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Finance Score', 15, currentY);
      currentY += 10;
      
      autoTable(pdf, {
        startY: currentY,
        head: [['Metric', 'Score']],
        body: [
          ['Financial Score', `${scoreData.finance.financial_score}/10`],
          ['Commercialization Potential', `${scoreData.finance.commercialization_potential}/10`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 15, right: 15 }
      });
      currentY = pdf.lastAutoTable.finalY + 8;

      if (scoreData.finance.financial_risks && scoreData.finance.financial_risks.length > 0) {
        checkSpace(20);
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Financial Risks:', 15, currentY);
        currentY += 6;
        
        scoreData.finance.financial_risks.forEach((risk) => {
          checkSpace(8);
          pdf.setFontSize(10);
          const splitText = pdf.splitTextToSize(`• ${risk}`, pageWidth - 40);
          pdf.text(splitText, 20, currentY);
          currentY += splitText.length * 4 + 2;
        });
        currentY += 5;
      }

      // Novelty Score Section
      checkSpace(30);
      pdf.setFontSize(16);
      pdf.setTextColor(139, 92, 246);
      pdf.text('Novelty Score', 15, currentY);
      currentY += 10;
      
      autoTable(pdf, {
        startY: currentY,
        head: [['Metric', 'Value']],
        body: [
          ['Novelty Score', `${Number(scoreData.novelty.novelty_score).toFixed(1)}/10`],
          ['Total Proposals Checked', scoreData.novelty.total_proposals_checked || 0]
        ],
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 15, right: 15 }
      });
      currentY = pdf.lastAutoTable.finalY + 15;

      // Technical Score Section
      checkSpace(40);
      pdf.setFontSize(16);
      pdf.setTextColor(16, 185, 129);
      pdf.text('Technical Score', 15, currentY);
      currentY += 10;
      
      autoTable(pdf, {
        startY: currentY,
        head: [['Metric', 'Score']],
        body: [
          ['Technical Score', `${scoreData.technical.technical_score}/10`],
          ['Approach Clarity', `${scoreData.technical.approach_clarity_score}/10`],
          ['Resource Availability', `${scoreData.technical.resource_availability_score}/10`],
          ['Timeline Feasibility', `${scoreData.technical.timeline_feasibility_score}/10`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 15, right: 15 }
      });
      currentY = pdf.lastAutoTable.finalY + 8;

      if (scoreData.technical.technical_risks && scoreData.technical.technical_risks.length > 0) {
        checkSpace(20);
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Technical Risks:', 15, currentY);
        currentY += 6;
        
        scoreData.technical.technical_risks.forEach((risk) => {
          checkSpace(8);
          pdf.setFontSize(10);
          const splitText = pdf.splitTextToSize(`• ${risk}`, pageWidth - 40);
          pdf.text(splitText, 20, currentY);
          currentY += splitText.length * 4 + 2;
        });
        currentY += 5;
      }

      // Relevance Score Section
      checkSpace(40);
      pdf.setFontSize(16);
      pdf.setTextColor(245, 158, 11);
      pdf.text('Relevance Score', 15, currentY);
      currentY += 10;
      
      autoTable(pdf, {
        startY: currentY,
        head: [['Metric', 'Score']],
        body: [
          ['Relevance Score', `${scoreData.relevance.relevance_score}/10`],
          ['Industry Applicability', `${scoreData.relevance.industry_applicability_score}/10`],
          ['Ministry Alignment', `${scoreData.relevance.ministry_alignment_score}/10`],
          ['Safety & Environmental', `${scoreData.relevance.safety_environmental_impact_score}/10`],
          ['PSU Adoptability', `${scoreData.relevance.psu_adoptability_score}/10`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 15, right: 15 }
      });

      // Footer on all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleString('en-GB')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      pdf.save(`ScoreCard_${app.applicationNumber}.pdf`);
      alert('Score Card downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading score card:', error);
      alert('Failed to download score card. Please try again.');
    }
  };

  const toggleExpand = (appId) => {
    setExpandedApp(expandedApp === appId ? null : appId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'under-review': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

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
                onClick={() => navigate('/applicant/dashboard')}
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <Link
                to="/applicant/dashboard"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Application Updates
              </h2>
              <p className="text-gray-600 text-lg">
                Track the progress of your submitted applications
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
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
          <div className="space-y-6">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Application Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
                          {app.applicationNumber}
                        </span>
                        <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          app.status === 'under-review' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                          {app.status === 'rejected' && <XCircle className="w-4 h-4" />}
                          {app.status === 'under-review' && <Clock className="w-4 h-4" />}
                          {app.status === 'pending' && <AlertCircle className="w-4 h-4" />}
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{app.projectTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpand(app._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedApp === app._id ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-8 px-4 pb-6">
                    <div className="relative pt-8">
                      {/* Progress Bar Container */}
                      <div className="relative" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                        <ProgressBar
                          percent={getProgressPercentage(app.status)}
                          filledBackground={
                            app.status === 'approved' ? '#16a34a' :
                            app.status === 'rejected' ? '#dc2626' :
                            '#dc2626'
                          }
                          height={6}
                          unfilledBackground="#e5e7eb"
                        >
                          <Step transition="scale">
                            {({ accomplished }) => (
                              <div className="relative flex flex-col items-center">
                                {/* Icon */}
                                <div
                                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg ${
                                    getProgressStep(app.status) >= 1
                                      ? 'bg-red-600 border-red-600'
                                      : 'bg-white border-gray-300'
                                  }`}
                                  style={{ 
                                    position: 'absolute',
                                    top: '-28px',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <FileText className={`w-7 h-7 ${getProgressStep(app.status) >= 1 ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                {/* Label Below */}
                                <p 
                                  className={`text-xs font-semibold whitespace-nowrap text-center ${getProgressStep(app.status) >= 1 ? 'text-red-600' : 'text-gray-500'}`}
                                  style={{ 
                                    position: 'absolute',
                                    top: '35px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '100px'
                                  }}
                                >
                                  Submitted
                                </p>
                              </div>
                            )}
                          </Step>
                          <Step transition="scale">
                            {({ accomplished }) => (
                              <div className="relative flex flex-col items-center">
                                {/* Icon */}
                                <div
                                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg ${
                                    getProgressStep(app.status) >= 2
                                      ? 'bg-red-600 border-red-600'
                                      : 'bg-white border-gray-300'
                                  }`}
                                  style={{ 
                                    position: 'absolute',
                                    top: '-28px',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <Clock className={`w-7 h-7 ${getProgressStep(app.status) >= 2 ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                {/* Label Below */}
                                <p 
                                  className={`text-xs font-semibold whitespace-nowrap text-center ${getProgressStep(app.status) >= 2 ? 'text-red-600' : 'text-gray-500'}`}
                                  style={{ 
                                    position: 'absolute',
                                    top: '35px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '100px'
                                  }}
                                >
                                  Under Review
                                </p>
                              </div>
                            )}
                          </Step>
                          <Step transition="scale">
                            {({ accomplished }) => (
                              <div className="relative flex flex-col items-center">
                                {/* Icon */}
                                <div
                                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg ${
                                    app.status === 'approved'
                                      ? 'bg-green-600 border-green-600'
                                      : app.status === 'rejected'
                                      ? 'bg-red-600 border-red-600'
                                      : 'bg-white border-gray-300'
                                  }`}
                                  style={{ 
                                    position: 'absolute',
                                    top: '-28px',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  {app.status === 'approved' ? (
                                    <CheckCircle className="w-7 h-7 text-white" />
                                  ) : app.status === 'rejected' ? (
                                    <XCircle className="w-7 h-7 text-white" />
                                  ) : (
                                    <AlertCircle className="w-7 h-7 text-gray-400" />
                                  )}
                                </div>
                                {/* Label Below */}
                                <p 
                                  className={`text-xs font-semibold whitespace-nowrap text-center ${
                                    app.status === 'approved' ? 'text-green-600' :
                                    app.status === 'rejected' ? 'text-red-600' :
                                    'text-gray-500'
                                  }`}
                                  style={{ 
                                    position: 'absolute',
                                    top: '35px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '120px'
                                  }}
                                >
                                  {app.status === 'approved' ? 'Accepted' : app.status === 'rejected' ? 'Rejected' : 'Decision Pending'}
                                </p>
                              </div>
                            )}
                          </Step>
                        </ProgressBar>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedApp === app._id && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* View AI Evaluated Score Card */}
                      <button
                        onClick={() => navigate(`/applicant/scorecard/${app._id}`)}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">View AI Score Card</h4>
                          <p className="text-xs text-gray-600">Check evaluation scores</p>
                        </div>
                      </button>

                      {/* View Evaluators Remarks */}
                      <button
                        onClick={() => navigate(`/applicant/remarks/${app._id}`)}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all group"
                      >
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">Evaluator Remarks</h4>
                          <p className="text-xs text-gray-600">Read detailed feedback</p>
                        </div>
                      </button>

                      {/* Download Score Card */}
                      <button
                        onClick={() => handleDownloadScoreCard(app)}
                        className="flex items-center gap-3 p-4 bg-white border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all group"
                      >
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <Download className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">Download Score Card</h4>
                          <p className="text-xs text-gray-600">Get PDF report</p>
                        </div>
                      </button>

                      {/* Request Re-evaluation - Only for rejected applications */}
                      {app.status === 'rejected' && (
                        <button
                          onClick={() => handleRequestReEvaluation(app._id)}
                          disabled={reEvaluating === app._id}
                          className="flex items-center gap-3 p-4 bg-white border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            {reEvaluating === app._id ? (
                              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                            ) : (
                              <RefreshCw className="w-6 h-6 text-orange-600" />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">Request Re-evaluation</h4>
                            <p className="text-xs text-gray-600">Submit for review again</p>
                          </div>
                        </button>
                      )}

                      {/* Submit Another Application */}
                      <Link
                        to="/applicant/submit-application"
                        className="flex items-center gap-3 p-4 bg-white border-2 border-red-200 rounded-xl hover:border-red-400 hover:shadow-lg transition-all group"
                      >
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <PlusCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">Submit for Revaluation</h4>
                          <p className="text-xs text-gray-600">Create another proposal</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationUpdates;
