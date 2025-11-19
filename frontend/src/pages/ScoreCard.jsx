import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const ScoreCard = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluatorRemarks, setEvaluatorRemarks] = useState('');
  const [proposalDecision, setProposalDecision] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scoreCardRef = useRef(null);

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

  useEffect(() => {
    // once application is fetched, load the scorecard
    if (application && application.applicationNumber) {
      fetchScoreCard(application.applicationNumber);
    }
  }, [application]);

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

  const fetchScoreCard = async (appNumber) => {
    try {
      const token = localStorage.getItem('token');
      const resp = await axios.get(`http://localhost:5000/api/scorecard/${appNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.data.success && resp.data.score) {
        const s = resp.data.score;
        // map backend structure to UI-friendly scoreData
        setScoreData({
          finance: s.finance_score || {
            financial_score: 0,
            commercialization_potential: 0,
            financial_risks: []
          },
          novelty: s.novelty_score || {
            novelty_score: 0,
            total_proposals_checked: 0,
            similar_proposals: []
          },
          technical: s.technical_score || {
            technical_score: 0,
            approach_clarity_score: 0,
            resource_availability_score: 0,
            timeline_feasibility_score: 0,
            technical_risks: []
          },
          relevance: s.relevance_score || {
            relevance_score: 0,
            industry_applicability_score: 0,
            ministry_alignment_score: 0,
            safety_environmental_impact_score: 0,
            psu_adoptability_score: 0
          }
        });
      }
    } catch (err) {
      console.error('Error fetching scorecard:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const calculateOverallScore = () => {
    const values = [];
    if (scoreData.finance?.financial_score) values.push(Number(scoreData.finance.financial_score));
    if (scoreData.novelty?.novelty_score) values.push(Number(scoreData.novelty.novelty_score));
    if (scoreData.technical?.technical_score) values.push(Number(scoreData.technical.technical_score));
    if (scoreData.relevance?.relevance_score) values.push(Number(scoreData.relevance.relevance_score));
    if (values.length === 0) return '0.0';
    const avg = values.reduce((a,b)=>a+b,0) / values.length;
    return avg.toFixed(1);
  };

  const pieData = [
    { name: 'Finance', value: scoreData.finance.financial_score, color: '#3B82F6' },
    { name: 'Novelty', value: scoreData.novelty.novelty_score, color: '#8B5CF6' },
    { name: 'Technical', value: scoreData.technical.technical_score, color: '#10B981' },
    { name: 'Relevance', value: scoreData.relevance.relevance_score, color: '#F59E0B' }
  ];

  // Open evaluation modal with pre-filled data
  const handleOpenEvaluate = () => {
    setEvaluationData(JSON.parse(JSON.stringify(scoreData))); // Deep copy
    setProposalDecision(application.status || '');
    setEvaluatorRemarks('');
    setShowEvaluateModal(true);
  };

  // Handle evaluation form submission
  const handleCompleteEvaluation = async () => {
    if (!proposalDecision) {
      alert('Please select a decision (Accept/Reject)');
      return;
    }
    if (!evaluatorRemarks.trim()) {
      alert('Please provide evaluator remarks');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update scorecard
      await axios.put(
        `http://localhost:5000/api/scorecard/${application.applicationNumber}`,
        {
          finance_score: evaluationData.finance,
          novelty_score: evaluationData.novelty,
          technical_score: evaluationData.technical,
          relevance_score: evaluationData.relevance,
          evaluator_remarks: evaluatorRemarks
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update application status
      await axios.put(
        `http://localhost:5000/api/applications/${id}/status`,
        { status: proposalDecision },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Evaluation completed successfully!');
      setShowEvaluateModal(false);
      
      // Refresh data
      fetchApplicationDetails();
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      alert('Failed to submit evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download ScoreCard as PDF
  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;
      
      // Helper function to check space and add page if needed
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
          ['Application Number', application.applicationNumber],
          ['Project Title', application.projectTitle],
          ['Institution', application.institutionName],
          ['Status', application.status.toUpperCase()],
          ['Submitted Date', new Date(application.submittedAt).toLocaleDateString('en-GB')],
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
      pdf.save(`ScoreCard_${application.applicationNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

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
        {/* Back Button and Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/evaluator/applications')}
            className="text-purple-600 hover:text-purple-800 flex items-center gap-2 font-semibold"
          >
            <span>←</span> Back to Applications
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleOpenEvaluate}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span>✏️</span> Evaluate ScoreCard
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>⬇️</span> Download ScoreCard
            </button>
          </div>
        </div>

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
                  <p className="text-3xl font-bold text-purple-600">{Number(scoreData.novelty.novelty_score).toFixed(1)}/10</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Proposals Checked</p>
                  <p className="text-3xl font-bold text-purple-600">{scoreData.novelty.total_proposals_checked}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Similar Proposals:</p>
                {scoreData.novelty.similar_proposals && scoreData.novelty.similar_proposals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-gray-700">Application Number</th>
                          <th className="text-right py-2 text-gray-700">Similarity %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scoreData.novelty.similar_proposals.map((proposal, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 text-gray-700">{proposal.application_number}</td>
                            <td className="py-2 text-right text-purple-600 font-semibold">{proposal.similarity_percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No similar proposals found</p>
                )}
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

      {/* Evaluation Modal */}
      {showEvaluateModal && evaluationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-[75vw] h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Evaluate Score Card</h2>
                <button
                  onClick={() => setShowEvaluateModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-purple-100 mt-2">{application.projectTitle}</p>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Finance Score Section */}
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="text-xl font-bold text-blue-700 mb-4">💰 Finance Score</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financial Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.finance.financial_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          finance: { ...evaluationData.finance, financial_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commercialization Potential (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.finance.commercialization_potential}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          finance: { ...evaluationData.finance, commercialization_potential: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Risks (one per line)
                    </label>
                    <textarea
                      value={evaluationData.finance.financial_risks?.join('\n') || ''}
                      onChange={(e) => setEvaluationData({
                        ...evaluationData,
                        finance: { ...evaluationData.finance, financial_risks: e.target.value.split('\n').filter(r => r.trim()) }
                      })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Novelty Score Section */}
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="text-xl font-bold text-purple-700 mb-4">💡 Novelty Score</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Novelty Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.novelty.novelty_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          novelty: { ...evaluationData.novelty, novelty_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Proposals Checked
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={evaluationData.novelty.total_proposals_checked || 0}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          novelty: { ...evaluationData.novelty, total_proposals_checked: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Score Section */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="text-xl font-bold text-green-700 mb-4">🔧 Technical Score</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technical Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.technical.technical_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          technical: { ...evaluationData.technical, technical_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approach Clarity (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.technical.approach_clarity_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          technical: { ...evaluationData.technical, approach_clarity_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resource Availability (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.technical.resource_availability_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          technical: { ...evaluationData.technical, resource_availability_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeline Feasibility (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.technical.timeline_feasibility_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          technical: { ...evaluationData.technical, timeline_feasibility_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Risks (one per line)
                    </label>
                    <textarea
                      value={evaluationData.technical.technical_risks?.join('\n') || ''}
                      onChange={(e) => setEvaluationData({
                        ...evaluationData,
                        technical: { ...evaluationData.technical, technical_risks: e.target.value.split('\n').filter(r => r.trim()) }
                      })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Relevance Score Section */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <h3 className="text-xl font-bold text-orange-700 mb-4">🎯 Relevance Score</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relevance Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.relevance.relevance_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          relevance: { ...evaluationData.relevance, relevance_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry Applicability (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.relevance.industry_applicability_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          relevance: { ...evaluationData.relevance, industry_applicability_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ministry Alignment (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.relevance.ministry_alignment_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          relevance: { ...evaluationData.relevance, ministry_alignment_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Safety & Environmental (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.relevance.safety_environmental_impact_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          relevance: { ...evaluationData.relevance, safety_environmental_impact_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PSU Adoptability (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={evaluationData.relevance.psu_adoptability_score}
                        onChange={(e) => setEvaluationData({
                          ...evaluationData,
                          relevance: { ...evaluationData.relevance, psu_adoptability_score: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Decision Section */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Proposal Decision</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision *
                    </label>
                    <select
                      value={proposalDecision}
                      onChange={(e) => setProposalDecision(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Decision</option>
                      <option value="approved">✅ Approve</option>
                      <option value="rejected">❌ Reject</option>
                      <option value="under-review">🔍 Under Review</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evaluator's Remarks *
                    </label>
                    <textarea
                      value={evaluatorRemarks}
                      onChange={(e) => setEvaluatorRemarks(e.target.value)}
                      placeholder="Provide detailed remarks about your evaluation..."
                      rows="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEvaluateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteEvaluation}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Evaluation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
