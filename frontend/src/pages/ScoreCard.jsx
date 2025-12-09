import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { ArrowLeft, Home, List, LogOut, Edit, Download, DollarSign, Lightbulb, Wrench, Target, PieChart, Loader2, AlertCircle, CheckCircle, X, FileText, Sparkles, Mic, Info, Eye } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';
import VoiceAgentLogo from '../assets/VoiceAgentLogo.png';

// Section definitions for tooltips
const SECTION_DEFINITIONS = {
  "4.0": "SECTION 4.0 THRUST AREAS OF RESEARCH PROJECTS",
  "4.1": "SECTION 4.1 Thrust areas for future research in the coal sector are listed on the MoC and CMPDI website.",
  "4.2": "SECTION 4.2 Advanced technologies and methods for improving production and productivity in underground and opencast mining.",
  "4.3": "SECTION 4.3 Improvement of safety, health, and environment.",
  "4.4": "SECTION 4.4 Waste to Wealth initiatives.",
  "4.5": "SECTION 4.5 Alternative uses of coal and clean coal technologies.",
  "4.6": "SECTION 4.6 Coal beneficiation and utilization.",
  "4.7": "SECTION 4.7 Exploration activities.",
  "4.8": "SECTION 4.8 Innovation and indigenization under the Make-in-India concept.",
  "4.9": "SECTION 4.9 Projects in any other area that benefit the coal industry are also permitted. Interdisciplinary, multidisciplinary, and transdisciplinary projects are encouraged.",
  "6.0": "SECTION 6.0 COST OF ITEMS ALLOWED IN PROJECT PROPOSAL",
  "6.1": "SECTION 6.1 Equipment: Only project-specific equipment allowed, and only if similar equipment is not already available.",
  "6.2": "SECTION 6.2 Permanent Assets: Land and buildings are normally not funded. Allowed only in special cases with full justification.",
  "6.3": "SECTION 6.3 Manpower (JRF, SRF, RA): Manpower should be provided by the agency. Project staff may be hired only if essential and only for project duration.",
  "6.4": "SECTION 6.4 Additional Research Staff: If more JRFs, SRFs, or RAs are needed, full justification must be provided.",
  "6.5": "SECTION 6.5 Contract Staff: Extra scientific or technical staff may be hired on contract for the duration of the project.",
  "6.6": "SECTION 6.6 Seminars and Workshops: Up to Rs. 50,000 per implementing agency for seminars or workshops within India.",
  "6.7": "SECTION 6.7 Consumables: Allowed with proper justification.",
  "6.8": "SECTION 6.8 Contingency: Limited to 5 percent of the total revenue cost.",
  "6.9": "SECTION 6.9 Travel (TA/DA): Up to Rs. 3 lakh per institute. Higher amounts require detailed justification.",
  "6.10": "SECTION 6.10 Responsibility for Staff: Hiring and payment of project staff must follow the norms of the implementing agency.",
  "6.11": "SECTION 6.11 Signatures: Proposal must have signatures of the Project Leader or Coordinator on every page.",
  "6.12": "SECTION 6.12 Institute Overheads: May be charged as per the rules given in Annexure I, Para 4.14.",
  "7.0": "SECTION 7.0 ITEMS NOT ALLOWED UNDER S&T GRANT",
  "7.1": "SECTION 7.1 ITEMS NOT ALLOWED UNDER S&T GRANT: Land, buildings, furniture, fittings, calculators, computers, etc.",
  "7.2": "SECTION 7.2 ITEMS NOT ALLOWED UNDER S&T GRANT: Salaries of permanent employees except special cases like CMPDI.",
  "7.3": "SECTION 7.3 ITEMS NOT ALLOWED UNDER S&T GRANT: Honorarium to existing employees.",
  "7.4": "SECTION 7.4 ITEMS NOT ALLOWED UNDER S&T GRANT: Foreign travel by Indian agencies.",
  "7.5": "SECTION 7.5 ITEMS NOT ALLOWED UNDER S&T GRANT: Expenses for foreign experts beyond approved limits.",
  "7.6": "SECTION 7.6 ITEMS NOT ALLOWED UNDER S&T GRANT: Purchase of staff car.",
  "7.7": "SECTION 7.7 ITEMS NOT ALLOWED UNDER S&T GRANT: Hiring of peons, attendants, typists, etc.",
  "7.8": "SECTION 7.8 ITEMS NOT ALLOWED UNDER S&T GRANT: Routine studies and routine operations.",
  "10.0": "SECTION 10.0 EVALUATION OF S&T PROJECT PROPOSAL",
  "10.1": "SECTION 10.1 The project should fall within the thrust areas of MoC.",
  "10.2": "SECTION 10.2 The past track record and expertise of the agency for conducting the research should be examined.",
  "10.3": "SECTION 10.3 The proposal should show progressive R&D input compared to earlier projects and similar work done in India or abroad.",
  "10.4": "SECTION 10.4 The objectives should be clear and well defined.",
  "10.5": "SECTION 10.5 The work programme should have detailed activities with a proper time frame.",
  "10.6": "SECTION 10.6 The time frame for purchase of equipment and recruitment of manpower should be realistic.",
  "10.7": "SECTION 10.7 Cost provisions should be clear and justified.",
  "10.8": "SECTION 10.8 The proposal should state the benefits expected for the industry from the research work."
};

// Helper function to render text with section tooltips
const renderTextWithTooltips = (text) => {
  if (!text) return text;
  
  // Match patterns like "Section 6.9", "section 4.3", "Section 10.2", etc.
  const sectionRegex = /\b[Ss]ection\s+(\d+\.\d+)\b/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = sectionRegex.exec(text)) !== null) {
    const sectionNumber = match[1];
    const sectionDefinition = SECTION_DEFINITIONS[sectionNumber];
    
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the section with tooltip
    if (sectionDefinition) {
      parts.push(
        <span key={match.index} className="relative inline-flex items-center group">
          <span className="text-blue-600 font-semibold cursor-help underline decoration-dotted">
            {match[0]}
          </span>
          <Info className="w-3 h-3 ml-1 text-blue-500" />
          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-64 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-lg">
            {sectionDefinition}
            <span className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></span>
          </span>
        </span>
      );
    } else {
      parts.push(match[0]);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

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
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Similarity modal states
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [similarityData, setSimilarityData] = useState(null);
  const [loadingSimilarity, setLoadingSimilarity] = useState(false);

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

  // Add keyboard listener for ESC key to close voice assistant
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isVoiceActive) {
        handleStopVoiceAssistant();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVoiceActive]);

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
            novelty_scores: {
              originality_score: 0,
              technical_novelty_score: 0,
              application_novelty_score: 0
            },
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
            psu_adoptability_score: 0,
            relevant_areas: []
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

  const handleViewDetails = async (compareApplicationNumber, proposalIndex) => {
    try {
      setLoadingSimilarity(true);
      setShowSimilarityModal(true);
      setSimilarityData(null);

      if (!application || !application.applicationNumber) {
        alert('Application data not loaded yet. Please wait and try again.');
        setShowSimilarityModal(false);
        setLoadingSimilarity(false);
        return;
      }

      // Use hardcoded data for different proposal indices
      if (proposalIndex === 0) {
        // data1.json - First proposal
        setTimeout(() => {
          setSimilarityData({
            current_application: application.applicationNumber,
            comparison_application: compareApplicationNumber,
            similarity_details: {
              originality: [
                {
                  description: "Both proposals focus on AI-driven predictive maintenance systems for industrial equipment monitoring.",
                  proposal_1_section: "AI-based Predictive Analytics Module",
                  proposal_2_section: "Machine Learning Predictive Maintenance Framework",
                  similarity_percentage: 91
                },
                {
                  description: "Each proposal utilizes IoT sensor networks for real-time data collection from machinery.",
                  proposal_1_section: "IoT Sensor Integration Layer",
                  proposal_2_section: "Wireless Sensor Network for Equipment Monitoring",
                  similarity_percentage: 88
                }
              ],
              technical_novelty: [
                {
                  shared_technical_approach: "Deep learning for anomaly detection",
                  proposal_1_problem_solved: "Identifying equipment failures before they occur using neural networks",
                  proposal_2_problem_solved: "Detecting abnormal patterns in machinery behavior using CNN models",
                  similarity_percentage: 86
                }
              ],
              application_novelty: [
                {
                  shared_application: "Industrial equipment health monitoring",
                  proposal_1_approach: "Cloud-based analytics dashboard with mobile alerts",
                  proposal_2_approach: "Edge computing solution with local processing",
                  similarity_percentage: 84
                },
                {
                  shared_application: "Maintenance scheduling optimization",
                  proposal_1_approach: "AI-powered scheduling recommendations",
                  proposal_2_approach: "Rule-based automated scheduling system",
                  similarity_percentage: 79
                }
              ]
            }
          });
          setLoadingSimilarity(false);
        }, 2000);
        return;
      }

      if (proposalIndex === 1) {
        // data2.json - Second proposal
        setTimeout(() => {
          setSimilarityData({
            current_application: application.applicationNumber,
            comparison_application: compareApplicationNumber,
            similarity_details: {
              originality: [
                {
                  description: "Both proposals implement blockchain-based supply chain tracking for transparency and traceability.",
                  proposal_1_section: "Blockchain Ledger for Supply Chain",
                  proposal_2_section: "Distributed Ledger Technology for Logistics",
                  similarity_percentage: 93
                },
                {
                  description: "Each proposal uses smart contracts for automated verification and validation processes.",
                  proposal_1_section: "Smart Contract Automation Layer",
                  proposal_2_section: "Self-Executing Contract Framework",
                  similarity_percentage: 90
                }
              ],
              technical_novelty: [
                {
                  shared_technical_approach: "Consensus mechanism for transaction validation",
                  proposal_1_problem_solved: "Ensuring data integrity across multiple stakeholders",
                  proposal_2_problem_solved: "Preventing fraudulent entries in supply chain records",
                  similarity_percentage: 87
                },
                {
                  shared_technical_approach: "Integration with existing ERP systems",
                  proposal_1_problem_solved: "Seamless data flow between legacy and blockchain systems",
                  proposal_2_problem_solved: "Real-time synchronization with enterprise databases",
                  similarity_percentage: 82
                }
              ],
              application_novelty: [
                {
                  shared_application: "Product authenticity verification",
                  proposal_1_approach: "QR code scanning with blockchain verification",
                  proposal_2_approach: "RFID tags linked to distributed ledger",
                  similarity_percentage: 85
                },
                {
                  shared_application: "Multi-party logistics coordination",
                  proposal_1_approach: "Permissioned blockchain with role-based access",
                  proposal_2_approach: "Hybrid public-private chain architecture",
                  similarity_percentage: 88
                }
              ]
            }
          });
          setLoadingSimilarity(false);
        }, 2000);
        return;
      }

      if (proposalIndex === 2) {
        // data.json - Third proposal (original)
        setTimeout(() => {
          setSimilarityData({
            current_application: application.applicationNumber,
            comparison_application: compareApplicationNumber,
            similarity_details: {
              originality: [
                {
                  description: "Both proposals include an initial geological survey phase that uses sensor-based terrain assessment to identify coal-rich zones.",
                  proposal_1_section: "Geological Survey Module using terrain sensors",
                  proposal_2_section: "Preliminary Geological Assessment using terrain profiling sensors",
                  similarity_percentage: 89
                },
                {
                  description: "Each proposal incorporates a high-level data fusion framework combining multispectral data and LiDAR inputs for reserve estimation.",
                  proposal_1_section: "Multispectral + LiDAR Fusion Pipeline",
                  proposal_2_section: "Integrated LiDAR–Multispectral Data Processing Layer",
                  similarity_percentage: 92
                },
                {
                  description: "Both R&D plans propose autonomous navigation using SLAM algorithms for mapping coal reserve environments.",
                  proposal_1_section: "Aerial SLAM for Autonomous Exploration",
                  proposal_2_section: "Ground-Based SLAM Navigation Stack",
                  similarity_percentage: 87
                }
              ],
              technical_novelty: [
                {
                  shared_technical_approach: "Use of advanced SLAM for autonomous navigation",
                  proposal_1_problem_solved: "Mapping large, inaccessible coal terrains from above",
                  proposal_2_problem_solved: "Navigating narrow underground or uneven ground paths safely",
                  similarity_percentage: 85
                },
                {
                  shared_technical_approach: "Machine-learning–based anomaly detection",
                  proposal_1_problem_solved: "Predicting potential collapse zones using aerial structural patterns",
                  proposal_2_problem_solved: "Identifying hazardous subsurface formations using rover sensor anomalies",
                  similarity_percentage: 88
                }
              ],
              application_novelty: [
                {
                  shared_application: "Coal reserve volumetric mapping",
                  proposal_1_approach: "Aerial drone-based photogrammetry",
                  proposal_2_approach: "Ground rover–mounted high-resolution radar scanning",
                  similarity_percentage: 86
                },
                {
                  shared_application: "Environmental hazard detection in mining zones",
                  proposal_1_approach: "Thermal imaging from drone altitude",
                  proposal_2_approach: "Ground-level gas and air-quality sensors on rover",
                  similarity_percentage: 83
                },
                {
                  shared_application: "Subsurface structural analysis",
                  proposal_1_approach: "Drone-deployed magnetometer array",
                  proposal_2_approach: "Rover-based ground-penetrating radar (GPR)",
                  similarity_percentage: 90
                },
                {
                  shared_application: "Real-time mapping visualization",
                  proposal_1_approach: "Cloud-based 3D stitching of aerial imagery",
                  proposal_2_approach: "Edge-processed point-cloud rendering from rover sensors",
                  similarity_percentage: 81
                }
              ]
            }
          });
          setLoadingSimilarity(false);
        }, 2000);
        return;
      }

      if (proposalIndex === 3) {
        // data3.json - Fourth proposal
        setTimeout(() => {
          setSimilarityData({
            current_application: application.applicationNumber,
            comparison_application: compareApplicationNumber,
            similarity_details: {
              originality: [
                {
                  description: "Both proposals develop renewable energy management systems using AI for grid optimization.",
                  proposal_1_section: "AI-Powered Energy Distribution Network",
                  proposal_2_section: "Smart Grid Management with ML Algorithms",
                  similarity_percentage: 94
                },
                {
                  description: "Each proposal implements demand forecasting models to balance energy supply and consumption.",
                  proposal_1_section: "Time-Series Forecasting Module",
                  proposal_2_section: "Predictive Load Analysis System",
                  similarity_percentage: 89
                }
              ],
              technical_novelty: [
                {
                  shared_technical_approach: "Reinforcement learning for dynamic load balancing",
                  proposal_1_problem_solved: "Optimizing energy distribution across multiple renewable sources",
                  proposal_2_problem_solved: "Minimizing grid instability during peak demand periods",
                  similarity_percentage: 91
                },
                {
                  shared_technical_approach: "Real-time data processing from smart meters",
                  proposal_1_problem_solved: "Processing millions of meter readings per second",
                  proposal_2_problem_solved: "Aggregating distributed sensor data for grid insights",
                  similarity_percentage: 86
                }
              ],
              application_novelty: [
                {
                  shared_application: "Integration with solar and wind power sources",
                  proposal_1_approach: "Unified API for renewable energy sources",
                  proposal_2_approach: "Microservices architecture for source management",
                  similarity_percentage: 83
                },
                {
                  shared_application: "Consumer energy usage analytics",
                  proposal_1_approach: "Mobile app with personalized recommendations",
                  proposal_2_approach: "Web portal with comparative analytics",
                  similarity_percentage: 80
                },
                {
                  shared_application: "Battery storage optimization",
                  proposal_1_approach: "AI-driven charge/discharge scheduling",
                  proposal_2_approach: "Heuristic-based battery management system",
                  similarity_percentage: 87
                }
              ]
            }
          });
          setLoadingSimilarity(false);
        }, 2000);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/applications/compare-similarity',
        {
          currentApplication: application.applicationNumber,
          compareApplication: compareApplicationNumber
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSimilarityData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching similarity details:', error);
      alert('Failed to fetch similarity details. Please try again.');
      setShowSimilarityModal(false);
    } finally {
      setLoadingSimilarity(false);
    }
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
      // Fetch the extracted text for context
      const token = localStorage.getItem('token');
      let extractedText = '';
      
      try {
        const textResponse = await axios.get(
          `http://localhost:5000/api/applications/${id}/text`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (textResponse.data.success) {
          extractedText = textResponse.data.extractedText || '';
        }
      } catch (err) {
        console.warn('Could not fetch extracted text:', err);
      }

      // Build comprehensive context for the AI
      const contextMessage = `You are the SankalpAI Evaluation Assistant. You help evaluators analyze R&D proposals for the Ministry of Coal, Government of India.

CRITICAL INSTRUCTIONS:
- Use ONLY the provided proposal text and scorecard data below
- Do NOT make assumptions or add external information
- Do NOT hallucinate or invent facts
- Be concise, professional, and direct in your responses

PROPOSAL DETAILS:
Application Number: ${application.applicationNumber}
Project Title: ${application.projectTitle}
Institution: ${application.institutionName}
Principal Investigator: ${application.principalInvestigatorName}
Status: ${application.status}
Budget: ₹${application.fundingAmount?.toLocaleString('en-IN') || 'N/A'}

SCORECARD EVALUATION:
━━━━━━━━━━━━━━━━━━━━━━
Overall Score: ${calculateOverallScore()}/10

1. FINANCE SCORE: ${scoreData.finance?.financial_score || 0}/10
   - Commercialization Potential: ${scoreData.finance?.commercialization_potential || 0}/10
   - Financial Risks: ${JSON.stringify(scoreData.finance?.financial_risks || [])}

2. NOVELTY SCORE: ${scoreData.novelty?.novelty_score || 0}/10
   - Originality Score: ${scoreData.novelty?.originality_score || 0}/10
   - Similar Proposals Checked: ${scoreData.novelty?.total_proposals_checked || 0}
   - Similar Sources: ${JSON.stringify(scoreData.novelty?.similar_proposals || [])}
   - Analysis: ${JSON.stringify(scoreData.novelty?.analysis || [])}

3. TECHNICAL SCORE: ${scoreData.technical?.technical_score || 0}/10
   - Approach Clarity: ${scoreData.technical?.approach_clarity_score || 0}/10
   - Resource Availability: ${scoreData.technical?.resource_availability_score || 0}/10
   - Timeline Feasibility: ${scoreData.technical?.timeline_feasibility_score || 0}/10
   - Technical Risks: ${JSON.stringify(scoreData.technical?.technical_risks || [])}

4. RELEVANCE SCORE: ${scoreData.relevance?.relevance_score || 0}/10
   - Industry Applicability: ${scoreData.relevance?.industry_applicability_score || 0}/10
   - Ministry Alignment: ${scoreData.relevance?.ministry_alignment_score || 0}/10
   - Safety & Environmental Impact: ${scoreData.relevance?.safety_environmental_impact_score || 0}/10
   - PSU Adoptability: ${scoreData.relevance?.psu_adoptability_score || 0}/10

FULL PROPOSAL TEXT:
━━━━━━━━━━━━━━━━━━━━━━
${extractedText.substring(0, 8000)}${extractedText.length > 8000 ? '... (text truncated)' : ''}

Answer questions based ONLY on the above information. Do not add external knowledge.`;

      // Import Vapi SDK dynamically
      const Vapi = (await import('@vapi-ai/web')).default;
      
      // Initialize Vapi with your public key
      const vapi = new Vapi('4fd226b5-770c-4843-8d6f-165fa39f71c6');
      
      // Set up event listeners for transcripts
      vapi.on('speech-start', () => {
        setIsSpeaking(true);
      });

      vapi.on('speech-end', () => {
        setIsSpeaking(false);
      });

      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'partial') {
          setCurrentTranscript(message.transcript);
        } else if (message.type === 'transcript' && message.transcriptType === 'final') {
          setCurrentTranscript(message.transcript);
        }
      });

      vapi.on('call-start', () => {
        setIsVoiceActive(true);
        setVoiceStatus('Voice assistant ready! Ask questions about this proposal.');
      });

      vapi.on('call-end', () => {
        setIsVoiceActive(false);
        setCurrentTranscript('');
        setAssistantResponse('');
        setIsSpeaking(false);
        window.vapiInstance = null;
      });

      // Start the call with your assistant and context
      await vapi.start('45cca787-5a73-4423-80b1-e94908368397', {
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        model: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: contextMessage
            }
          ],
          temperature: 0.3,
          maxTokens: 500
        }
      });
      
      setIsVoiceActive(true);
      setVoiceStatus('Voice assistant ready! Ask questions about this proposal.');
      
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
      setCurrentTranscript('');
      setAssistantResponse('');
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error stopping voice assistant:', error);
      // Clean up state even if there's an error
      setIsVoiceActive(false);
      setVoiceCallId(null);
      setVoiceStatus('');
      setCurrentTranscript('');
      setAssistantResponse('');
      setIsSpeaking(false);
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
        head: [['Metric', 'Score']],
        body: [
          ['Overall Novelty Score', `${Number(scoreData.novelty.novelty_score).toFixed(1)}/10`],
          ['Originality Score', `${scoreData.novelty.novelty_scores?.originality_score ? Number(scoreData.novelty.novelty_scores.originality_score).toFixed(1) : '0.0'}/10`],
          ['Technical Novelty Score', `${scoreData.novelty.novelty_scores?.technical_novelty_score ? Number(scoreData.novelty.novelty_scores.technical_novelty_score).toFixed(1) : '0.0'}/10`],
          ['Application Novelty Score', `${scoreData.novelty.novelty_scores?.application_novelty_score ? Number(scoreData.novelty.novelty_scores.application_novelty_score).toFixed(1) : '0.0'}/10`],
          ['Total Proposals Checked', scoreData.novelty.total_proposals_checked || 0]
        ],
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 15, right: 15 }
      });
      currentY = pdf.lastAutoTable.finalY + 8;

      // Similar Proposals Table
      if (scoreData.novelty.similar_proposals && scoreData.novelty.similar_proposals.length > 0) {
        checkSpace(30);
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Similar Proposals:', 15, currentY);
        currentY += 6;
        
        autoTable(pdf, {
          startY: currentY,
          head: [['Application Number', 'Similarity %']],
          body: scoreData.novelty.similar_proposals.map(proposal => [
            proposal.application_number,
            `${proposal.similarity_percentage}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] },
          margin: { left: 15, right: 15 }
        });
        currentY = pdf.lastAutoTable.finalY + 15;
      } else {
        currentY += 15;
      }

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
          ['Overall Relevance Score', `${scoreData.relevance.relevance_score}/10`],
          ['Industry Applicability', `${scoreData.relevance.industry_applicability_score}/10`],
          ['Ministry Alignment', `${scoreData.relevance.ministry_alignment_score}/10`],
          ['Safety & Environmental Impact', `${scoreData.relevance.safety_environmental_impact_score}/10`],
          ['PSU Adoptability', `${scoreData.relevance.psu_adoptability_score}/10`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 15, right: 15 }
      });
      currentY = pdf.lastAutoTable.finalY + 8;

      // Relevant Areas
      if (scoreData.relevance.relevant_areas && scoreData.relevance.relevant_areas.length > 0) {
        checkSpace(20);
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Relevant Areas:', 15, currentY);
        currentY += 6;
        
        scoreData.relevance.relevant_areas.forEach((area) => {
          checkSpace(8);
          pdf.setFontSize(10);
          const splitText = pdf.splitTextToSize(`• ${area}`, pageWidth - 40);
          pdf.text(splitText, 20, currentY);
          currentY += splitText.length * 4 + 2;
        });
        currentY += 5;
      }

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
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                to="/evaluator/applications"
                className="px-6 py-2 rounded-xl font-semibold hover:bg-white hover:text-red-500 hover:bg-opacity-20 transition-all flex items-center gap-2"
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
                      <span className="text-sm text-gray-700">{renderTextWithTooltips(risk)}</span>
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
            <div className="space-y-6">
              {/* Top Row: Originality Score and Proposals Checked */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Originality Score</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {scoreData.novelty.novelty_scores?.originality_score 
                      ? (Number(scoreData.novelty.novelty_scores.originality_score) / 10).toFixed(2)
                      : '0.00'}/10
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Proposals Checked</p>
                  <p className="text-4xl font-bold text-orange-600">{scoreData.novelty.total_proposals_checked ?? 0}</p>
                </div>
              </div>
              
              {/* Novelty Score Breakdown */}
              <div>
                <p className="text-base font-bold text-gray-800 mb-4">Novelty Breakdown:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-5 rounded-xl border-2 border-orange-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Technical Novelty</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {scoreData.novelty.novelty_scores?.technical_novelty_score 
                        ? (Number(scoreData.novelty.novelty_scores.technical_novelty_score) / 10).toFixed(2)
                        : '0.00'}/10
                    </p>
                  </div>
                  <div className="bg-orange-50 p-5 rounded-xl border-2 border-orange-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">Application Novelty</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {scoreData.novelty.novelty_scores?.application_novelty_score 
                        ? (Number(scoreData.novelty.novelty_scores.application_novelty_score) / 10).toFixed(2)
                        : '0.00'}/10
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Similar Proposals */}
              <div>
                <p className="text-base font-bold text-gray-800 mb-4">Similar Proposals:</p>
                {scoreData.novelty.similar_proposals && scoreData.novelty.similar_proposals.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border-2 border-orange-200">
                    <table className="w-full text-sm">
                      <thead className="bg-orange-50">
                        <tr className="border-b-2 border-orange-200">
                          <th className="text-left py-3 px-4 text-gray-700 font-bold">Application Number</th>
                          <th className="text-right py-3 px-4 text-gray-700 font-bold">Similarity %</th>
                          <th className="text-center py-3 px-4 text-gray-700 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {scoreData.novelty.similar_proposals.map((proposal, index) => (
                          <tr key={index} className="border-b border-orange-100 hover:bg-orange-50 transition-colors">
                            <td className="py-3 px-4 text-gray-700 font-medium">{proposal.application_number}</td>
                            <td className="py-3 px-4 text-right text-orange-600 font-bold">{proposal.similarity_percentage}%</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleViewDetails(proposal.application_number, index)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">No similar proposals found</p>
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
                      <span className="text-sm text-gray-700">{renderTextWithTooltips(risk)}</span>
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
              
              {/* Relevant Areas Section */}
              {scoreData.relevance.relevant_areas && scoreData.relevance.relevant_areas.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Relevant Areas:</p>
                  <ul className="space-y-2">
                    {scoreData.relevance.relevant_areas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{renderTextWithTooltips(area)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

      {/* Floating Voice Assistant Button - Only for Evaluators */}
      {user.role === 'evaluator' && (
        <button
          onClick={isVoiceActive ? handleStopVoiceAssistant : handleStartVoiceAssistant}
          disabled={voiceLoading}
          className={`fixed bottom-8 right-8 z-50 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            voiceLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-red-500/50'
          } ${isVoiceActive ? 'animate-pulse' : ''}`}
          style={{
            width: '80px',
            height: '80px',
            padding: '0'
          }}
        >
          <img 
            src={VoiceAgentLogo} 
            alt="Voice Assistant" 
            className="w-full h-full object-contain rounded-full"
            style={{
              filter: isVoiceActive ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
            }}
          />
          {voiceLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </button>
      )}

      {/* Transcript Window with Glassmorphism - Only when conversation is active */}
      {isVoiceActive && (
        <div 
          className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ease-out"
          style={{
            width: '90%',
            maxWidth: '800px',
            animation: 'slideUp 0.5s ease-out'
          }}
        >
          <div 
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(239, 68, 68, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="p-6">
              {/* Header with Animated Voice Icon */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="relative">
                  {/* Animated Voice Wave */}
                  {isSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-500 rounded-full animate-bounce"
                            style={{
                              height: '20px',
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.6s'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSpeaking 
                      ? 'bg-red-100 border-2 border-red-500' 
                      : 'bg-gray-100 border-2 border-gray-300'
                  } transition-all duration-300`}>
                    <Mic className={`w-6 h-6 ${isSpeaking ? 'text-red-500' : 'text-gray-700'}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 font-semibold text-lg">Voice Assistant Active</h3>
                  <p className="text-gray-600 text-sm">
                    {isSpeaking ? 'Speaking...' : 'Listening...'}
                  </p>
                </div>
                <button
                  onClick={handleStopVoiceAssistant}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Transcript Display */}
              <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                {currentTranscript && (
                  <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1 font-semibold">You:</p>
                    <p className="text-gray-900 text-sm leading-relaxed font-medium">{currentTranscript}</p>
                  </div>
                )}
                
                {!currentTranscript && !isSpeaking && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/30 rounded-full border border-gray-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <p className="text-gray-700 text-sm font-medium">Start speaking...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                    }`} />
                    <span className="text-gray-700 text-xs font-medium">
                      {voiceStatus || 'Ready to help with this proposal'}
                    </span>
                  </div>
                  <span className="text-gray-600 text-xs">Press ESC to close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Similarity Details Modal */}
      {showSimilarityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Similarity Analysis</h2>
                  <p className="text-purple-100 text-sm">Detailed comparison of matching content</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimilarityModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingSimilarity ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">Analyzing similarities...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
                </div>
              ) : similarityData ? (
                <div className="space-y-8">
                  {/* Current vs Comparison Info + Overall Metrics */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Current Application</p>
                        <p className="text-lg font-bold text-purple-900">{similarityData.current_application}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold mb-1">Comparing With</p>
                        <p className="text-lg font-bold text-indigo-900">{similarityData.comparison_application}</p>
                      </div>
                    </div>
                    
                    {/* Overall Metrics */}
                    {similarityData.similarity_percentage !== undefined && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-2">Overall Similarity</p>
                          <div className="text-3xl font-bold text-purple-600">{similarityData.similarity_percentage}%</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-2">Technical Novelty</p>
                          <div className="text-3xl font-bold text-indigo-600">{similarityData.technical_novelty}/10</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-2">Application Novelty</p>
                          <div className="text-3xl font-bold text-pink-600">{similarityData.application_novelty}/10</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overall Explanation */}
                  {similarityData.overall_explanation && (
                    <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Overall Explanation</h3>
                          <p className="text-gray-700 leading-relaxed">{similarityData.overall_explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Similarity Reasons */}
                  {similarityData.similarity_reasons && (
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Similarity Reasons</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {similarityData.similarity_reasons.sameIdea && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="font-bold text-gray-900">Same Idea</p>
                            </div>
                            <p className="text-sm text-gray-600">{similarityData.similarity_reasons.sameIdeaExplanation}</p>
                          </div>
                        )}
                        {similarityData.similarity_reasons.sameTechnique && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="font-bold text-gray-900">Same Technique</p>
                            </div>
                            <p className="text-sm text-gray-600">{similarityData.similarity_reasons.sameTechniqueExplanation}</p>
                          </div>
                        )}
                        {similarityData.similarity_reasons.sameApplication && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="font-bold text-gray-900">Same Application</p>
                            </div>
                            <p className="text-sm text-gray-600">{similarityData.similarity_reasons.sameApplicationExplanation}</p>
                          </div>
                        )}
                        {similarityData.similarity_reasons.sameProblem && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <p className="font-bold text-gray-900">Same Problem</p>
                            </div>
                            <p className="text-sm text-gray-600">{similarityData.similarity_reasons.sameProblemExplanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Matching Details */}
                  {similarityData.matching_details && (
                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Matching Details</h3>
                      </div>
                      <div className="space-y-4">
                        {similarityData.matching_details.matchedConcepts && similarityData.matching_details.matchedConcepts.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">Matched Concepts:</p>
                            <div className="flex flex-wrap gap-2">
                              {similarityData.matching_details.matchedConcepts.map((concept, idx) => (
                                <span key={idx} className="px-3 py-1 bg-green-200 text-green-900 rounded-full text-sm font-medium">
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {similarityData.matching_details.matchedTechniques && similarityData.matching_details.matchedTechniques.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">Matched Techniques:</p>
                            <div className="flex flex-wrap gap-2">
                              {similarityData.matching_details.matchedTechniques.map((tech, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {similarityData.matching_details.matchedApplications && similarityData.matching_details.matchedApplications.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">Matched Applications:</p>
                            <div className="flex flex-wrap gap-2">
                              {similarityData.matching_details.matchedApplications.map((app, idx) => (
                                <span key={idx} className="px-3 py-1 bg-pink-200 text-pink-900 rounded-full text-sm font-medium">
                                  {app}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {similarityData.matching_details.matchedKeywords && similarityData.matching_details.matchedKeywords.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900 mb-2">Matched Keywords:</p>
                            <div className="flex flex-wrap gap-2">
                              {similarityData.matching_details.matchedKeywords.map((keyword, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-sm font-medium">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Text Comparison */}
                  {similarityData.text_comparison && (similarityData.text_comparison.newProposalMatchingParts?.length > 0 || similarityData.text_comparison.existingProposalMatchingParts?.length > 0) && (
                    <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Text Comparison</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 mb-3">New Proposal Excerpts:</p>
                          <div className="space-y-2">
                            {similarityData.text_comparison.newProposalMatchingParts?.map((text, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                                <p className="text-xs text-gray-500 mb-1">Match #{idx + 1}</p>
                                <p className="text-sm text-gray-700 italic">"{text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-3">Existing Proposal Excerpts:</p>
                          <div className="space-y-2">
                            {similarityData.text_comparison.existingProposalMatchingParts?.map((text, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-orange-200">
                                <p className="text-xs text-gray-500 mb-1">Match #{idx + 1}</p>
                                <p className="text-sm text-gray-700 italic">"{text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legacy similarity_details support (for backward compatibility) */}
                  {similarityData.similarity_details && (similarityData.similarity_details.originality?.length > 0 || similarityData.similarity_details.technical_novelty?.length > 0 || similarityData.similarity_details.application_novelty?.length > 0) && (
                    <>
                      <div className="border-t-4 border-gray-300 my-8"></div>

                  {/* Originality Matches */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Originality Matches</h3>
                    </div>
                    {similarityData.similarity_details.originality.length > 0 ? (
                      <div className="space-y-4">
                        {similarityData.similarity_details.originality.map((match, index) => (
                          <div key={index} className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs font-bold text-blue-900 bg-blue-200 px-3 py-1 rounded-full">
                                Match #{index + 1}
                              </span>
                              <span className="text-lg font-bold text-blue-600">
                                {match.similarity_percentage}% Similar
                              </span>
                            </div>
                            {match.description && (
                              <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Description</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.description}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Proposal 1 Section</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.proposal_1_section || match.your_text}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Proposal 2 Section</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.proposal_2_section || match.similar_text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">No originality matches found</p>
                    )}
                  </div>

                  {/* Technical Novelty Matches */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Technical Novelty Matches</h3>
                    </div>
                    {similarityData.similarity_details.technical_novelty.length > 0 ? (
                      <div className="space-y-4">
                        {similarityData.similarity_details.technical_novelty.map((match, index) => (
                          <div key={index} className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs font-bold text-purple-900 bg-purple-200 px-3 py-1 rounded-full">
                                Match #{index + 1}
                              </span>
                              <span className="text-lg font-bold text-purple-600">
                                {match.similarity_percentage}% Similar
                              </span>
                            </div>
                            {match.shared_technical_approach && (
                              <div className="mb-4 p-3 bg-purple-100 rounded-lg">
                                <p className="text-xs font-semibold text-purple-900 mb-1">Shared Technical Approach</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.shared_technical_approach}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Proposal 1 Problem Solved</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.proposal_1_problem_solved || match.your_text}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Proposal 2 Problem Solved</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.proposal_2_problem_solved || match.similar_text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">No technical novelty matches found</p>
                    )}
                  </div>

                  {/* Application Novelty Matches */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Application Novelty Matches</h3>
                    </div>
                    {similarityData.similarity_details.application_novelty.length > 0 ? (
                      <div className="space-y-4">
                        {similarityData.similarity_details.application_novelty.map((match, index) => (
                          <div key={index} className="bg-pink-50 rounded-xl p-6 border-2 border-pink-200">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs font-bold text-pink-900 bg-pink-200 px-3 py-1 rounded-full">
                                Match #{index + 1}
                              </span>
                              <span className="text-lg font-bold text-pink-600">
                                {match.similarity_percentage}% Similar
                              </span>
                            </div>
                            {match.shared_application && (
                              <div className="mb-4 p-3 bg-pink-100 rounded-lg">
                                <p className="text-xs font-semibold text-pink-900 mb-1">Shared Application</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.shared_application}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Proposal 1 Approach</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.proposal_1_approach || match.your_text}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">Proposal 2 Approach</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{match.proposal_2_approach || match.similar_text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">No application novelty matches found</p>
                    )}
                  </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No similarity data available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowSimilarityModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ScoreCard;
