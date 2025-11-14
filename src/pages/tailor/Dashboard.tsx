import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Order, TailorProfile } from '../../types';
import { Package, TrendingUp, Users, DollarSign } from 'lucide-react';

export const TailorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<TailorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          const { data: tailorProfile } = await supabase
            .from('tailor_profiles')
            .select('*')
            .eq('user_id', user.data.user.id)
            .maybeSingle();

          if (tailorProfile) {
            setProfile(tailorProfile);

            const { data: tailorOrders } = await supabase
              .from('orders')
              .select('*')
              .eq('tailor_id', tailorProfile.id)
              .order('created_at', { ascending: false });

            if (tailorOrders) {
              setOrders(tailorOrders);
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

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package },
    { label: 'Active Orders', value: orders.filter(o => ['in_progress', 'accepted'].includes(o.status)).length, icon: TrendingUp },
    { label: 'Rating', value: profile?.rating.toFixed(1) || '0', icon: Users },
    { label: 'Total Earnings', value: `₹${orders.reduce((sum, o) => sum + o.final_paid, 0).toFixed(0)}`, icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tailor Workshop</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className="text-blue-600" size={32} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Queue</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order #</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/tailor/orders/${order.id}`)}>
                          <td className="px-6 py-4 text-sm text-gray-900">{order.order_number}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{order.total_amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No orders yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/tailor/profile')}
                className="w-full bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition text-left"
              >
                <p className="font-semibold text-gray-900">Edit Profile</p>
                <p className="text-sm text-gray-600">Update your business details</p>
              </button>
              <button
                onClick={() => navigate('/tailor/earnings')}
                className="w-full bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition text-left"
              >
                <p className="font-semibold text-gray-900">View Earnings</p>
                <p className="text-sm text-gray-600">Track your payments</p>
              </button>
              <button
                onClick={() => navigate('/tailor/chats')}
                className="w-full bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition text-left"
              >
                <p className="font-semibold text-gray-900">Messages</p>
                <p className="text-sm text-gray-600">Chat with customers</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard;
