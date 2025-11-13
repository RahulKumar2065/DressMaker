import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LogOut, Home, ShoppingBag, Users, BarChart3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, signOut, profile } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  const navItems = {
    customer: [
      { label: 'Dashboard', icon: Home, href: '/customer/dashboard' },
      { label: 'Try On', icon: ShoppingBag, href: '/customer/try-on' },
      { label: 'Measurements', icon: ShoppingBag, href: '/customer/measurements' },
    ],
    tailor: [
      { label: 'Dashboard', icon: Home, href: '/tailor/dashboard' },
      { label: 'Orders', icon: ShoppingBag, href: '/tailor/orders' },
      { label: 'Earnings', icon: BarChart3, href: '/tailor/earnings' },
    ],
    admin: [
      { label: 'Dashboard', icon: BarChart3, href: '/admin/dashboard' },
      { label: 'Users', icon: Users, href: '/admin/users' },
      { label: 'Disputes', icon: Home, href: '/admin/disputes' },
    ],
  };

  const items = role ? navItems[role] : [];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate(role === 'customer' ? '/customer/dashboard' : role === 'tailor' ? '/tailor/dashboard' : '/admin/dashboard')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              DressMaker
            </button>
            <div className="hidden md:flex gap-1">
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
