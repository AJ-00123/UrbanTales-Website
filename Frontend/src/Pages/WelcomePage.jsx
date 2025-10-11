import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { User, Store } from 'lucide-react';
import { HashLoader } from 'react-spinners'; // Import HashLoader

function WelcomePage() {
  const [active, setActive] = useState('user');
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a loading period for 3 seconds
    const timer = setTimeout(() => setLoading(false), 3000); // Changed to 3000ms for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (type) => {
    setActive(type);
    if (type === 'seller') {
      navigate('/seller-onboarding');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        {/* HashLoader component with customizable color and size */}
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[20vh] bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 md:p-10 flex flex-col md:flex-row items-center justify-between border border-gray-200">
          
          {/* Left Side */}
          <div className="w-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6 leading-snug">
              Welcome to <span className="text-pink-600">UrbanTales</span>
            </h1>
            <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto">
              Start your journey with us — whether you're a buyer looking for great deals or a seller ready to shine!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button
                onClick={() => handleClick('user')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 text-lg font-semibold transition duration-300 shadow-md ${
                  active === 'user'
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'
                }`}
              >
                <User className="w-5 h-5" />
                I'm a User
              </button>
              <button
                onClick={() => handleClick('seller')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 text-lg font-semibold transition duration-300 shadow-md ${
                  active === 'seller'
                    ? 'bg-pink-600 text-white border-pink-600 hover:bg-pink-700'
                    : 'bg-white text-pink-600 border-pink-600 hover:bg-pink-100'
                }`}
              >
                <Store className="w-5 h-5" />
                I'm a Seller
              </button>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default WelcomePage;
