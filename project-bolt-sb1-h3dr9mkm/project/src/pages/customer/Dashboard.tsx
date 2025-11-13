import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { TailorProfile, Order } from '../../types';
import { Search, Star, MapPin, Phone } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: verifiedTailors } = await supabase
          .from('tailor_profiles')
          .select('*')
          .eq('is_verified', true)
          .limit(6)
          .order('rating', { ascending: false });

        if (verifiedTailors) {
          setTailors(verifiedTailors);
        }

        const user = await supabase.auth.getUser();
        if (user.data.user) {
          const { data: customerProfile } = await supabase
            .from('customer_profiles')
            .select('id')
            .eq('user_id', user.data.user.id)
            .maybeSingle();

          if (customerProfile) {
            const { data: orders } = await supabase
              .from('orders')
              .select('*')
              .eq('customer_id', customerProfile.id)
              .order('created_at', { ascending: false })
              .limit(5);

            if (orders) {
              setRecentOrders(orders);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTailors = tailors.filter(
    (tailor) =>
      tailor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tailor.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome Back!</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{recentOrders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Active Orders</p>
            <p className="text-3xl font-bold text-blue-600">{recentOrders.filter(o => ['in_progress', 'accepted'].includes(o.status)).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{recentOrders.filter(o => o.status === 'delivered').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Find Tailors</p>
            <button
              onClick={() => navigate('/customer/tailors')}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Browse →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Tailors</h2>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tailors by name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTailors.map((tailor) => (
                <div
                  key={tailor.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
                  onClick={() => navigate(`/customer/tailor/${tailor.id}`)}
                >
                  {tailor.business_image_url && (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 object-cover">
                      <img
                        src={tailor.business_image_url}
                        alt={tailor.business_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{tailor.business_name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(tailor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">({tailor.total_orders} orders)</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {tailor.city}, {tailor.state}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      {tailor.phone}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{tailor.experience_years} years experience</p>
                </div>
              ))}
            </div>

            {filteredTailors.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No tailors found. Try adjusting your search.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
                    onClick={() => navigate(`/customer/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-gray-900">{order.order_number}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">₹{order.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <button
                    onClick={() => navigate('/customer/tailors')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Place your first order →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
