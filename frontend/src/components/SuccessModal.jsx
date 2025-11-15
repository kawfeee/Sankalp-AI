import { useNavigate } from 'react-router-dom';

const SuccessModal = ({ applicationNumber, onClose }) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/applicant/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
        {/* Green Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Application Submitted Successfully!
        </h2>

        {/* Application Number */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 text-center mb-1">
            Your Application Number
          </p>
          <p className="text-2xl font-bold text-blue-600 text-center tracking-wide">
            {applicationNumber}
          </p>
        </div>

        {/* Info Message */}
        <p className="text-sm text-gray-600 text-center mb-6">
          Please save this application number for future reference.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleGoToDashboard}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
