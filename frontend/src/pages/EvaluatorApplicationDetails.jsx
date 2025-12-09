import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, Building2, MapPin, Home, Mail, CreditCard, Calendar, FileText, Download, ExternalLink, Loader2, CheckCircle, XCircle, Clock, AlertCircle, LogOut, List, ChevronDown, ChevronUp } from 'lucide-react';
import NationalEmblem from '../assets/National Emblem.png';
import ReactMarkdown from 'react-markdown';

const EvaluatorApplicationDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [proposalSections, setProposalSections] = useState([]);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom after everything is loaded
    if (!loading && !textLoading && proposalSections.length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, textLoading, proposalSections]);

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
        // Fetch extracted text after getting application
        fetchExtractedText(token);
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError(err.response?.data?.message || 'Failed to load application details');
      setLoading(false);
    }
  };

  const cleanText = (text) => {
    if (!text) return '';
    
    // Remove page numbers (various formats)
    let cleaned = text
      // Remove page numbers in format: -- 2 of 4 --
      .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gim, '')
      // Remove standalone page numbers (Page 1, Page 1 of 10, etc.)
      .replace(/^Page\s+\d+(\s+of\s+\d+)?$/gim, '')
      // Remove lines with just numbers (page numbers)
      .replace(/^\s*\d+\s*$/gm, '')
      // Remove page numbers at start/end of lines (1 |, | 1, -1-, etc.)
      .replace(/^\s*[\|\-]\s*\d+\s*[\|\-]?\s*$/gm, '')
      .replace(/^\s*\d+\s*[\|\-]\s*$/gm, '')
      // Remove footer/header page numbers (bottom/top of page patterns)
      .replace(/^\s*\d+\s*[\/\|]\s*\d+\s*$/gm, '')
      // Remove lines with only dashes/underscores (decorative separators)
      .replace(/^\s*[-_=]{3,}\s*$/gm, '')
      // Remove multiple consecutive blank lines (more than 2)
      .replace(/\n\s*\n\s*\n\s*\n+/g, '\n\n')
      // Remove excessive spaces (more than 2 consecutive spaces)
      .replace(/ {3,}/g, ' ')
      // Remove trailing spaces from each line
      .replace(/[ \t]+$/gm, '')
      // Remove leading spaces from blank lines
      .replace(/^\s+$/gm, '');
    
    return cleaned;
  };

  const convertToMarkdown = (text) => {
    if (!text) return '';
    
    let markdown = text;
    
    // Convert common patterns to markdown
    // Bold text (words in ALL CAPS at start of line)
    markdown = markdown.replace(/^([A-Z][A-Z\s]{2,}):?\s*$/gm, '### $1\n');
    
    // Bullet points (lines starting with - or •)
    markdown = markdown.replace(/^[\s]*[-•]\s+/gm, '- ');
    
    // Numbered lists (ensure proper formatting)
    markdown = markdown.replace(/^(\d+)\.\s+/gm, '$1. ');
    
    return markdown;
  };

  const fetchExtractedText = async (token) => {
    try {
      setTextLoading(true);
      const response = await axios.get(`http://localhost:5000/api/applications/${id}/text`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const cleaned = cleanText(response.data.extractedText);
        const markdown = convertToMarkdown(cleaned);
        setExtractedText(markdown);
        parseSections(markdown);
      }
    } catch (err) {
      console.error('Error fetching extracted text:', err);
    } finally {
      setTextLoading(false);
      setLoading(false);
    }
  };

  const parseSections = (text) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];

    // Enhanced section patterns - order matters!
    const sectionPatterns = [
      // "Section 1: Title" or "Section-1. Title"
      { regex: /^Section[\s-]*(\d+(?:\.\d+)?)[\s\.:;\-]+(.+)$/i, format: (m) => `Section ${m[1]}: ${m[2].trim()}` },
      // "Section 1" or "Section-1"
      { regex: /^Section[\s-]*(\d+(?:\.\d+)?)[\s]*$/i, format: (m) => `Section ${m[1]}` },
      // "1. Title" or "1.1 Title" (numbered with text)
      { regex: /^(\d+(?:\.\d+)?)[\s\.:;\-]+([A-Z].{3,80})$/, format: (m) => `${m[1]} ${m[2].trim()}` },
      // "1. " or "1.1. " (just number, title on next line)
      { regex: /^(\d+(?:\.\d+)?)[\.:]\s*$/, format: (m) => `Section ${m[1]}` },
      // All caps titles (minimum 3 words or 15 chars)
      { regex: /^([A-Z][A-Z\s&\-,]{10,80})$/, format: (m) => m[1].trim() },
      // Common section keywords
      { regex: /^(BACKGROUND|INTRODUCTION|EXECUTIVE SUMMARY|ABSTRACT|OBJECTIVES|GOALS|METHODOLOGY|APPROACH|IMPLEMENTATION|BUDGET|FINANCIAL|TIMELINE|SCHEDULE|DELIVERABLES|OUTCOMES|TEAM|PERSONNEL|RESOURCES|EQUIPMENT|REFERENCES|BIBLIOGRAPHY|CONCLUSION|SUMMARY|APPENDIX|ANNEXURE)[\s\.:;\-]*(.*)$/i, format: (m) => m[2] ? `${m[1]}: ${m[2].trim()}` : m[1] },
      // Underlined or emphasized titles (followed by ===, ---, ___)
      { regex: /^(.{5,80})$/, format: null, checkNext: true }
    ];

    const isSectionHeader = (line, nextLine) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length > 100 || trimmed.length < 3) return null;

      for (const pattern of sectionPatterns) {
        const match = trimmed.match(pattern.regex);
        if (match) {
          // If checkNext is true, verify next line has underline pattern
          if (pattern.checkNext && nextLine) {
            const nextTrimmed = nextLine.trim();
            if (/^[=\-_]{3,}$/.test(nextTrimmed)) {
              return { title: trimmed, skipNext: true };
            }
          } else if (pattern.format) {
            return { title: pattern.format(match), skipNext: false };
          }
        }
      }
      return null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1] : null;
      
      // Check if this line is a section header
      const sectionInfo = isSectionHeader(line, nextLine);

      if (sectionInfo) {
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          const content = currentContent.join('\n').trim();
          if (content) {
            sections.push({
              title: currentSection,
              content: content
            });
          }
        }
        
        currentSection = sectionInfo.title;
        currentContent = [];
        
        // Skip next line if it's an underline
        if (sectionInfo.skipNext) {
          i++;
        }
      } else if (trimmedLine) {
        // Add content to current section
        if (!currentSection) {
          currentSection = 'Introduction & Overview';
        }
        currentContent.push(line);
      } else if (currentSection && currentContent.length > 0) {
        // Preserve blank lines within content
        currentContent.push(line);
      }
    }

    // Add the last section
    if (currentSection && currentContent.length > 0) {
      const content = currentContent.join('\n').trim();
      if (content) {
        sections.push({
          title: currentSection,
          content: content
        });
      }
    }

    // Filter out very small sections (less than 50 chars) unless it's the only section
    const filteredSections = sections.length > 1 
      ? sections.filter(s => s.content.length > 50)
      : sections;

    // If no sections found or all filtered out, create a single section
    if (filteredSections.length === 0 && text) {
      filteredSections.push({
        title: 'Full Proposal Document',
        content: text
      });
    }

    setProposalSections(filteredSections);
  };

  const toggleSection = (index) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'under-review': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading application details...</p>
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

      {/* Application Details */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/evaluator/applications')}
                className="text-red-600 hover:text-red-700 mb-4 flex items-center gap-2 font-semibold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Applications
              </button>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {application.projectTitle}
              </h1>
              <p className="text-gray-600 text-lg">
                Application #{application.applicationNumber}
              </p>
            </div>
            <div>
              <span className={`px-6 py-3 rounded-xl text-base font-bold flex items-center gap-2 shadow-md ${getStatusColor(application.status)}`}>
                {application.status === 'approved' && <CheckCircle className="w-5 h-5" />}
                {application.status === 'rejected' && <XCircle className="w-5 h-5" />}
                {application.status === 'under-review' && <Clock className="w-5 h-5" />}
                {application.status === 'pending' && <AlertCircle className="w-5 h-5" />}
                {application.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* User Details Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Institution Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Institution Name</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.institutionName}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">City</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.city}</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Address</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.address}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">State</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.state}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">PIN Code</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.pinCode}</p>
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Project Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Project Title</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.projectTitle}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Domain</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">{application.domain}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Expected Budget</p>
              </div>
              <p className="text-lg text-gray-900 pl-6 font-semibold">₹{application.expectedBudget}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Submitted Date</p>
              </div>
              <p className="text-lg text-gray-900 pl-6">
                {new Date(application.submittedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-gray-500">Problem Statement</p>
              </div>
              <p className="text-base text-gray-800 leading-relaxed pl-6 bg-gray-50 p-4 rounded-xl">{application.problemStatement}</p>
            </div>
          </div>
        </div>

        {/* Proposal Sections (Accordion) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <button
            onClick={() => toggleSection('main')}
            className="w-full flex items-center justify-between mb-6 pb-4 border-b-2 border-red-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Proposal Sections
              </h2>
            </div>
            {openSections['main'] ? (
              <ChevronUp className="w-6 h-6 text-gray-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {openSections['main'] && (
            <>
              {textLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  <p className="ml-3 text-gray-600">Loading proposal sections...</p>
                </div>
              ) : proposalSections.length > 0 ? (
                <div className="space-y-3">
                  {proposalSections.map((section, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(index)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 text-left">
                            {section.title}
                          </h3>
                        </div>
                        {openSections[index] ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      
                      {openSections[index] && (
                        <div className="p-6 bg-white border-t border-gray-200">
                          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                            <ReactMarkdown
                              components={{
                                p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-gray-700" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-4 text-red-600" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3 text-red-600" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2 text-gray-800" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li className="leading-relaxed text-gray-700" {...props} />,
                                code: ({node, inline, ...props}) => 
                                  inline 
                                    ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-gray-800" {...props} />
                                    : <code className="block bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto text-gray-800" {...props} />,
                                pre: ({node, ...props}) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3" {...props} />
                              }}
                            >
                              {section.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No proposal sections available</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Project Document Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Project Document
            </h2>
          </div>
          <div className="flex items-center justify-between p-6 bg-red-50 rounded-xl border-2 border-red-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{application.pdfFileName}</p>
                <p className="text-sm text-gray-600">Project Detail PDF Document</p>
              </div>
            </div>
            <a
              href={application.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:shadow-lg flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Open PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorApplicationDetails;
