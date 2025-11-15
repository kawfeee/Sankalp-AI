import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelectionModal from './RoleSelectionModal';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setIsModalOpen(false);
    navigate(`/login/${role}`);
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-linear-to-r from-purple-600 to-purple-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-white cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-3xl font-bold tracking-wide">Sankalp-AI</h1>
            </div>
            <div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-purple-600 px-8 py-2.5 rounded-full font-semibold hover:bg-gray-100 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <RoleSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectRole={handleRoleSelect}
      />
    </>
  );
};

export default Navbar;
