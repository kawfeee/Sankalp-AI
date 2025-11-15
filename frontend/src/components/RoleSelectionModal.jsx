import React, { useState } from 'react';

const RoleSelectionModal = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Choose Your Role</h2>
        <p className="text-gray-600 mb-8 text-center">Select how you want to login</p>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelectRole('evaluator')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">👨‍💼</span>
              <span>Login as Evaluator</span>
            </div>
          </button>
          
          <button
            onClick={() => onSelectRole('applicant')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">👤</span>
              <span>Login as Applicant</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
