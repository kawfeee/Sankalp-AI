import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel images - using public folder for better reliability
  const carouselImages = [
    { src: '/Caro1.png', alt: 'Coal Innovation Slide 1' },
    { src: '/Caro2.png', alt: 'Energy Technology Slide 2' },
    { src: '/Caro3.png', alt: 'Research Development Slide 3' }
  ];

  // If user is logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'evaluator') {
        navigate('/evaluator/dashboard');
      } else if (user.role === 'applicant') {
        navigate('/applicant/dashboard');
      }
    }
  }, [user, navigate]);

  // Debug: Log images to console
  useEffect(() => {
    console.log('Carousel images:', carouselImages);
    carouselImages.forEach((img, idx) => {
      console.log(`Image ${idx + 1}:`, img.src);
    });
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Don't render anything if user is logged in (will redirect)
  if (user) {
    return null;
  }

  const evaluationCards = [
    {
      title: 'Finance Evaluation',
      description: 'AI-powered financial viability assessment with commercialization potential analysis',
      icon: (
        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'Technical Assessment',
      description: 'Comprehensive technical feasibility and innovation evaluation using advanced AI models',
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'Novelty Analysis',
      description: 'AI-driven originality detection and similarity analysis against existing research',
      icon: (
        <svg className="w-12 h-12 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'Relevance Scoring',
      description: 'Industry alignment and ministry priority assessment with environmental impact analysis',
      icon: (
        <svg className="w-12 h-12 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'bg-red-50 border-red-200'
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-red-600 shadow-lg border-b-2 border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Indian Emblem and Ministry */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Ministry of Coal</h1>
                <p className="text-sm text-red-100">Government of India</p>
              </div>
            </div>

            {/* Middle - Navigation Links */}
            <div className="hidden md:flex space-x-8 pl-10">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('process')}
                className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Process
              </button>
              <a 
                href="/proposal-format.pdf" 
                download 
                className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Format
              </a>
            </div>

            {/* Right Side - Login */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login/applicant"
                className="text-white hover:text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Applicant Login
              </Link>
              <Link
                to="/login/evaluator"
                className="bg-white text-red-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-50 border border-white transition-colors"
              >
                Evaluator Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Wide Carousel */}
      <div className="relative h-[600px] overflow-hidden">
        {carouselImages.map((imageObj, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={imageObj.src}
              alt={imageObj.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', imageObj.src);
                console.error('Full error:', e);
                // Show red background as fallback
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.minHeight = '600px';
              }}
              onLoad={() => console.log('✅ Image loaded successfully:', imageObj.src)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        ))}
        
        {/* Carousel Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-6xl font-bold mb-4">Sankalp AI</h1>
            <p className="text-2xl mb-8">Empowering Innovation in Coal & Energy Sector</p>
            <Link
              to="/signup/applicant"
              className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors inline-block"
            >
              Submit Your Proposal
            </Link>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hero Text and 4 Cards */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Text */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Sankalp AI - Smarter Evaluation, Stronger Innovation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Now funding made transparent, faster and bias-free with AI/ML
            </p>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {evaluationCards.map((card, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${card.color} hover:shadow-lg transition-shadow`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{card.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation Process */}
      <div id="process" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Evaluation Process</h2>
            <p className="text-xl text-gray-600">How Sankalp AI evaluates your R&D proposals</p>
          </div>

          {/* Flowchart */}
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-center items-center space-y-8 lg:space-y-0 lg:space-x-8">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Proposal</h3>
                <p className="text-center text-gray-600 text-sm">Upload your R&D proposal PDF with all required details</p>
              </div>

              {/* Arrow 1 */}
              <div className="hidden lg:block">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
                <p className="text-center text-gray-600 text-sm">Advanced AI models analyze your proposal across 4 dimensions</p>
              </div>

              {/* Arrow 2 */}
              <div className="hidden lg:block">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Scores</h3>
                <p className="text-center text-gray-600 text-sm">Comprehensive scoring across Finance, Technical, Novelty & Relevance</p>
              </div>

              {/* Arrow 3 */}
              <div className="hidden lg:block">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Review</h3>
                <p className="text-center text-gray-600 text-sm">Human evaluators review AI scores and make final decisions</p>
              </div>
            </div>

            {/* Process Description */}
            <div className="mt-16 bg-red-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Sankalp AI?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Faster Processing</h4>
                  <p className="text-gray-600">AI reduces evaluation time from weeks to days</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Bias-Free</h4>
                  <p className="text-gray-600">Objective AI analysis eliminates human bias</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Transparent</h4>
                  <p className="text-gray-600">Clear scoring criteria and detailed feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Contact Us</h2>
            <p className="text-xl text-gray-300">Get in touch with our teams for support and inquiries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Ministry of Coal */}
            <div className="bg-gray-800 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Ministry of Coal</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-300">Shastri Bhawan, New Delhi - 110001</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-300">+91-11-23382745</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-300">secy-coal@nic.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NACCER */}
            <div className="bg-gray-800 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">NACCER</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-300">Coal Block-7, CGO Complex, Lodhi Road, New Delhi - 110003</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-300">+91-11-24360715</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-300">director.naccer@coal.nic.in</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">
              © 2025 Ministry of Coal, Government of India. All rights reserved.
            </p>
            <p className="text-gray-400 mt-2">
              Powered by Sankalp AI - Transforming R&D Evaluation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;