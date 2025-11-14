import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Scissors, Zap, MapPin, MessageSquare, Shield } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">DressMaker</h1>
          <div className="flex gap-4">
            {user ? (
              <button
                onClick={() => navigate(role === 'customer' ? '/customer/dashboard' : role === 'tailor' ? '/tailor/dashboard' : '/admin/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Connect with Tailors, Create Perfect Fits</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              DressMaker bridges the gap between customers and skilled tailors. Discover talents, manage orders, and visualize designs in 3D before stitching.
            </p>
            <div className="flex gap-4 justify-center">
              {!user && (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Start as Customer
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                  >
                    Register as Tailor
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-16">Why Choose DressMaker?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Easy Discovery</h4>
                <p className="text-gray-600">Find trusted tailors near you with verified reviews and ratings.</p>
              </div>
              <div className="text-center">
                <Scissors className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Virtual Try-On</h4>
                <p className="text-gray-600">See how designs will look on you before finalizing your order.</p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Direct Communication</h4>
                <p className="text-gray-600">Chat directly with tailors, share ideas, and collaborate seamlessly.</p>
              </div>
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Live Tracking</h4>
                <p className="text-gray-600">Track your order delivery in real-time with GPS integration.</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h4>
                <p className="text-gray-600">Safe and secure transactions with integrated payment gateway.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
