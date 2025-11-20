import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { ArrowLeft, Home, List, LogOut, Edit, Download, DollarSign, Lightbulb, Wrench, Target, PieChart, Loader2, AlertCircle, CheckCircle, X, FileText, Sparkles, Mic } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';

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
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryType, setSummaryType] = useState('Descriptive Summary');
  const [summaryLength, setSummaryLength] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Voice Assistant states
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceCallId, setVoiceCallId] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');

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

  // Handle View PDF
  const handleViewPDF = () => {
    setShowPDFModal(true);
  };

  // Handle Generate Summary
  const handleGenerateSummary = async () => {
    if (!summaryLength || summaryLength <= 0) {
      alert(summaryType === 'Descriptive Summary' 
        ? 'Please enter the number of words for the summary'
        : 'Please enter the number of points for the summary');
      return;
    }

    setGeneratingSummary(true);
    try {
      const token = localStorage.getItem('token');
      
      const lengthText = summaryType === 'Descriptive Summary' 
        ? `${summaryLength} Words`
        : `${summaryLength} Points`;

      const response = await axios.post(
        'http://localhost:5000/api/summary/generate',
        {
          applicationNumber: application.applicationNumber,
          summaryType,
          summaryLength: lengthText
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Summary response:', response.data); // Debug log

      if (response.data.success) {
        // Generate PDF from summary
        generateSummaryPDF(response.data);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert(error.response?.data?.message || 'Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Generate PDF from summary data
  const generateSummaryPDF = (summaryData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let currentY = 20;

    // Header
    pdf.setFontSize(22);
    pdf.setTextColor(220, 38, 38);
    pdf.text('AI GENERATED SUMMARY', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
    
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Ministry of Coal - Government of India', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Application Details
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Application Details', 15, currentY);
    currentY += 8;

    autoTable(pdf, {
      startY: currentY,
      head: [['Field', 'Value']],
      body: [
        ['Application Number', summaryData.applicationNumber || 'N/A'],
        ['Project Title', summaryData.projectTitle || application.projectTitle || 'N/A'],
        ['Institution', summaryData.institutionName || application.institutionName || 'N/A'],
        ['Summary Type', summaryData.summaryType || 'N/A'],
        ['Summary Length', summaryData.summaryLength || 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      margin: { left: 15, right: 15 }
    });
    currentY = pdf.lastAutoTable.finalY + 15;

    // Summary Content
    pdf.setFontSize(14);
    pdf.setTextColor(220, 38, 38);
    pdf.text('Summary', 15, currentY);
    currentY += 10;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    // Clean and validate summary data
    const cleanText = (text) => {
      if (!text) return 'No summary available';
      // Remove non-printable characters and normalize text
      return text.replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
    };

    if (summaryData.summaryType === 'Descriptive Summary') {
      const summaryText = cleanText(summaryData.data?.summary || '');
      const splitText = pdf.splitTextToSize(summaryText, pageWidth - 30);
      pdf.text(splitText, 15, currentY);
    } else {
      // Point-wise summary
      const summaryPoints = summaryData.data?.summary || [];
      if (Array.isArray(summaryPoints)) {
        summaryPoints.forEach((point, index) => {
          const cleanPoint = cleanText(point);
          const pointText = pdf.splitTextToSize(`${index + 1}. ${cleanPoint}`, pageWidth - 35);
          pdf.text(pointText, 20, currentY);
          currentY += pointText.length * 5 + 3;
          
          // Add new page if needed
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
        });
      } else {
        pdf.text('Invalid summary format received', 15, currentY);
      }
    }

    // Footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        285,
        { align: 'center' }
      );
      pdf.text(
        `Generated on ${new Date().toLocaleDateString('en-IN')}`,
        pageWidth - 15,
        285,
        { align: 'right' }
      );
    }

    // Save PDF
    pdf.save(`AI_Summary_${summaryData.applicationNumber}.pdf`);
    setShowSummaryModal(false);
    setSummaryLength('');
    alert('Summary downloaded successfully!');
  };

  // Voice Assistant Functions
  const handleStartVoiceAssistant = async () => {
    setVoiceLoading(true);
    setVoiceStatus('Starting voice assistant...');
    
    try {
      // Import Vapi SDK dynamically
      const Vapi = (await import('@vapi-ai/web')).default;
      
      // Initialize Vapi with your public key
      const vapi = new Vapi('4fd226b5-770c-4843-8d6f-165fa39f71c6');
      
      // Start the call with your assistant
      await vapi.start('45cca787-5a73-4423-80b1-e94908368397');
      
      setIsVoiceActive(true);
      setVoiceStatus('Voice assistant ready! You can now speak your questions.');
      alert('Voice Assistant started! You can now speak your questions about this proposal.');
      
      // Store vapi instance for stopping later
      window.vapiInstance = vapi;
      
    } catch (error) {
      console.error('Error starting voice assistant:', error);
      setVoiceStatus('Failed to start voice assistant');
      alert('Failed to start voice assistant. Please try again.');
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleStopVoiceAssistant = async () => {
    try {
      setVoiceStatus('Ending voice session...');
      
      // Stop the Vapi call
      if (window.vapiInstance) {
        await window.vapiInstance.stop();
        window.vapiInstance = null;
      }
      
      setIsVoiceActive(false);
      setVoiceCallId(null);
      setVoiceStatus('');
      alert('Voice Assistant stopped.');
    } catch (error) {
      console.error('Error stopping voice assistant:', error);
      // Clean up state even if there's an error
      setIsVoiceActive(false);
      setVoiceCallId(null);
      setVoiceStatus('');
      window.vapiInstance = null;
    }
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
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading score card...</p>
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
            onClick={() => navigate('/evaluator/dashboard')}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/evaluator/applications"
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <List className="w-5 h-5" />
                All Applications
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

      {/* Score Card Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button and Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(user.role === 'evaluator' ? '/evaluator/applications' : '/applicant/application-updates')}
            className="text-red-600 hover:text-red-700 flex items-center gap-2 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {user.role === 'evaluator' ? 'Back to Applications' : 'Back to Updates'}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleViewPDF}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all hover:shadow-lg flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              View PDF
            </button>
            {user.role === 'evaluator' && (
              <button
                onClick={() => setShowSummaryModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Download AI Summary
              </button>
            )}
            {user.role === 'evaluator' && (
              <button
                onClick={handleOpenEvaluate}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:shadow-lg flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Evaluate
              </button>
            )}
            {user.role === 'evaluator' && (
              <button
                onClick={isVoiceActive ? handleStopVoiceAssistant : handleStartVoiceAssistant}
                disabled={voiceLoading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center gap-2 ${
                  isVoiceActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                } ${voiceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Mic className="w-5 h-5" />
                {voiceLoading ? 'Starting...' : (isVoiceActive ? 'Stop Voice Assistant' : 'Start Voice Assistant')}
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all hover:shadow-lg flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Score Card
            </button>
          </div>
        </div>

        {/* Voice Assistant Status */}
        {user.role === 'evaluator' && isVoiceActive && (
          <div className="mb-6 p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-800">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">Voice Assistant Active</span>
              <span>- Speak your questions about this proposal</span>
            </div>
            {voiceCallId && (
              <div className="mt-2 text-sm opacity-75">
                Session ID: {voiceCallId}
              </div>
            )}
          </div>
        )}

        {/* Top Card - Title, Institution, Overall Score with Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {application.projectTitle}
              </h1>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Institution</p>
                  <p className="text-xl font-semibold text-gray-900">{application.institutionName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Application Number</p>
                  <p className="text-lg font-semibold text-gray-900">{application.applicationNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Overall Score</p>
                  <p className="text-6xl font-bold text-red-600 mt-2">{calculateOverallScore()}/10</p>
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
          <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Finance Score
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Financial Score</p>
                  <p className="text-3xl font-bold text-red-600">{scoreData.finance.financial_score}/10</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Commercialization</p>
                  <p className="text-3xl font-bold text-red-600">{scoreData.finance.commercialization_potential}/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Financial Risks:</p>
                <ul className="space-y-2">
                  {scoreData.finance.financial_risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 2 - Novelty Score */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Novelty Score
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Novelty Score</p>
                  <p className="text-3xl font-bold text-orange-600">{Number(scoreData.novelty.novelty_score).toFixed(1)}/10</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Proposals Checked</p>
                  <p className="text-3xl font-bold text-orange-600">{scoreData.novelty.total_proposals_checked}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Similar Proposals:</p>
                {scoreData.novelty.similar_proposals && scoreData.novelty.similar_proposals.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Application Number</th>
                          <th className="text-right py-3 px-4 text-gray-700 font-semibold">Similarity %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scoreData.novelty.similar_proposals.map((proposal, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-gray-700">{proposal.application_number}</td>
                            <td className="py-3 px-4 text-right text-orange-600 font-semibold">{proposal.similarity_percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg">No similar proposals found</p>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3 - Technical Score */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Technical Score
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Technical Score</p>
                  <p className="text-3xl font-bold text-green-600">{scoreData.technical.technical_score}/10</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Approach Clarity</p>
                  <p className="text-3xl font-bold text-green-600">{scoreData.technical.approach_clarity_score}/10</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Resource Availability</p>
                  <p className="text-2xl font-bold text-green-600">{scoreData.technical.resource_availability_score}/10</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Timeline Feasibility</p>
                  <p className="text-2xl font-bold text-green-600">{scoreData.technical.timeline_feasibility_score}/10</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Technical Risks:</p>
                <ul className="space-y-2">
                  {scoreData.technical.technical_risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CARD 4 - Relevance Score */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Relevance Score
              </h2>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Overall Relevance Score</p>
                <p className="text-4xl font-bold text-yellow-600">{scoreData.relevance.relevance_score}/10</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Industry Applicability</p>
                  <p className="text-2xl font-bold text-yellow-600">{scoreData.relevance.industry_applicability_score}/10</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Ministry Alignment</p>
                  <p className="text-2xl font-bold text-yellow-600">{scoreData.relevance.ministry_alignment_score}/10</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Safety & Environmental</p>
                  <p className="text-2xl font-bold text-yellow-600">{scoreData.relevance.safety_environmental_impact_score}/10</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">PSU Adoptability</p>
                  <p className="text-2xl font-bold text-yellow-600">{scoreData.relevance.psu_adoptability_score}/10</p>
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
            <div className="bg-red-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Evaluate Score Card</h2>
                <button
                  onClick={() => setShowEvaluateModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-red-100 mt-2">{application.projectTitle}</p>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Finance Score Section */}
                <div className="border-2 border-red-100 rounded-xl p-6 bg-red-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Finance Score</h3>
                  </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Novelty Score Section */}
                <div className="border-2 border-orange-100 rounded-xl p-6 bg-orange-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Novelty Score</h3>
                  </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

      {/* PDF Viewer Modal */}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">View R&D Proposal PDF</h2>
                <p className="text-purple-100 mt-1">{application.projectTitle}</p>
              </div>
              <button
                onClick={() => setShowPDFModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              {application.pdfUrl ? (
                <iframe
                  src={application.pdfUrl}
                  className="w-full h-full border-0"
                  title="Application PDF"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">PDF not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Download AI Generated Summary</h2>
                  <p className="text-indigo-100 mt-1">Choose your summary preferences</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setSummaryLength('');
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Summary Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Which kind of summary do you want?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                    <input
                      type="radio"
                      name="summaryType"
                      value="Descriptive Summary"
                      checked={summaryType === 'Descriptive Summary'}
                      onChange={(e) => {
                        setSummaryType(e.target.value);
                        setSummaryLength('');
                      }}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Descriptive Summary</span>
                      <p className="text-sm text-gray-600">A comprehensive narrative summary</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 transition-all">
                    <input
                      type="radio"
                      name="summaryType"
                      value="Point-Wise Summary"
                      checked={summaryType === 'Point-Wise Summary'}
                      onChange={(e) => {
                        setSummaryType(e.target.value);
                        setSummaryLength('');
                      }}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Point-Wise Summary</span>
                      <p className="text-sm text-gray-600">Bullet points highlighting key aspects</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Length Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {summaryType === 'Descriptive Summary' 
                    ? 'How many words?' 
                    : 'How many points?'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={summaryType === 'Descriptive Summary' ? 1000 : 20}
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  placeholder={summaryType === 'Descriptive Summary' 
                    ? 'e.g., 200' 
                    : 'e.g., 5'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {summaryType === 'Descriptive Summary' 
                    ? 'Recommended: 100-500 words' 
                    : 'Recommended: 5-10 points'}
                </p>
              </div>

              {/* Application Info */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Application:</span> {application.applicationNumber}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Project:</span> {application.projectTitle}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    setSummaryLength('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  disabled={generatingSummary}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateSummary}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:bg-gray-400 flex items-center gap-2"
                  disabled={generatingSummary || !summaryLength}
                >
                  {generatingSummary ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate & Download
                    </>
                  )}
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
