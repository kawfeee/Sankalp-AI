import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SuccessModal from '../components/SuccessModal';

const SubmitApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: User Details
    institutionName: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    // Step 2: Project Details
    projectTitle: '',
    domain: '',
    problemStatement: '',
    expectedBudget: '',
    pdfFile: null
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({
        ...formData,
        pdfFile: file
      });
      setError('');
    } else {
      setError('Please upload a valid PDF file');
      e.target.value = '';
    }
  };

  const validateStep1 = () => {
    if (!formData.institutionName || !formData.address || !formData.city || 
        !formData.state || !formData.pinCode) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.pinCode.length !== 6 || !/^\d+$/.test(formData.pinCode)) {
      setError('Please enter a valid 6-digit PIN code');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.projectTitle || !formData.domain || !formData.problemStatement || 
        !formData.expectedBudget || !formData.pdfFile) {
      setError('Please fill in all required fields and upload a PDF');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('institutionName', formData.institutionName);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('pinCode', formData.pinCode);
      formDataToSend.append('projectTitle', formData.projectTitle);
      formDataToSend.append('domain', formData.domain);
      formDataToSend.append('problemStatement', formData.problemStatement);
      formDataToSend.append('expectedBudget', formData.expectedBudget);
      formDataToSend.append('pdfFile', formData.pdfFile);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Send to backend
      const response = await axios.post(
        'http://localhost:5000/api/applications',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Response from backend:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        setApplicationNumber(response.data.application.applicationNumber);
        setShowSuccessModal(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              Sankalp-AI
            </Link>
            <div className="flex gap-4">
              <Link
                to="/applicant/dashboard"
                className="px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-500 hover:bg-opacity-20 transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/applicant/submit-application"
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Submit Application
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Application</h1>
          <p className="text-gray-600 mb-8">Fill out the form below to submit your application</p>

          {/* Stepper Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        currentStep >= step
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                    <span className="text-sm mt-2 font-semibold text-gray-600">
                      {step === 1 && 'User Details'}
                      {step === 2 && 'Project Details'}
                      {step === 3 && 'Review & Confirm'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              Application submitted successfully! Redirecting to dashboard...
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: User Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">User Details</h3>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter institution name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    maxLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter 6-digit PIN code"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Project Details</h3>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    What is your Project Title? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your project title"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    What is your Domain / Area of Work? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Healthcare, Education, Technology"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    What problem are you solving? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Describe the problem you are addressing..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Expected Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expectedBudget"
                    value={formData.expectedBudget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., ₹50,000 - ₹2,00,000"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    PDF Submission <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.pdfFile && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {formData.pdfFile.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Review & Confirm</h3>
                
                {/* User Details Review */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">User Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Institution Name</p>
                      <p className="font-semibold text-gray-800">{formData.institutionName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-800">{formData.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-semibold text-gray-800">{formData.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">State</p>
                      <p className="font-semibold text-gray-800">{formData.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">PIN Code</p>
                      <p className="font-semibold text-gray-800">{formData.pinCode}</p>
                    </div>
                  </div>
                </div>

                {/* Project Details Review */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Project Details</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Project Title</p>
                      <p className="font-semibold text-gray-800">{formData.projectTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Domain / Area of Work</p>
                      <p className="font-semibold text-gray-800">{formData.domain}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Problem Statement</p>
                      <p className="font-semibold text-gray-800">{formData.problemStatement}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Budget</p>
                      <p className="font-semibold text-gray-800">{formData.expectedBudget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">PDF Submission</p>
                      <p className="font-semibold text-gray-800">{formData.pdfFile?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-12 py-3 rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          applicationNumber={applicationNumber}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default SubmitApplication;
