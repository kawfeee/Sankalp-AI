import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6">
        <div className="max-w-4xl text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Welcome to Sankalp-AI
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-6 opacity-95">
            Empowering your future with intelligent solutions
          </p>
          <p className="text-lg md:text-xl leading-relaxed mb-10 opacity-90 max-w-3xl mx-auto">
            Discover the power of artificial intelligence to transform your ideas into reality.
            Join us on a journey of innovation and excellence.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              Get Started
            </button>
            <button className="bg-transparent text-white border-2 border-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-600 transform hover:-translate-y-1 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">
          Why Choose Sankalp-AI?
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Fast & Efficient</h3>
            <p className="text-gray-600 leading-relaxed">
              Lightning-fast AI processing to get results in seconds
            </p>
          </div>
          <div className="bg-white p-10 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
            <div className="text-6xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Secure & Private</h3>
            <p className="text-gray-600 leading-relaxed">
              Your data is protected with enterprise-grade security
            </p>
          </div>
          <div className="bg-white p-10 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
            <div className="text-6xl mb-6">💡</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Solutions</h3>
            <p className="text-gray-600 leading-relaxed">
              Intelligent algorithms that adapt to your needs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
