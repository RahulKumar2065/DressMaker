import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Users, Package, DollarSign, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDisputes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customers, tailors, orders, disputes] = await Promise.all([
          supabase.from('customer_profiles').select('id', { count: 'exact' }),
          supabase.from('tailor_profiles').select('id', { count: 'exact' }),
          supabase.from('orders').select('total_amount', { count: 'exact' }),
          supabase.from('disputes').select('id', { count: 'exact' }).eq('status', 'open'),
        ]);

        let totalRevenue = 0;
        if (orders.data) {
          totalRevenue = orders.data.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
        }

        setStats({
          totalUsers: (customers.count || 0) + (tailors.count || 0),
          totalOrders: orders.count || 0,
          totalRevenue,
          activeDisputes: disputes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'green' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'purple' },
    { label: 'Active Disputes', value: stats.activeDisputes, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {statItems.map((item) => (
            <div key={item.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{item.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${item.color}-50`}>
                  <item.icon className={`text-${item.color}-600`} size={32} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Management Modules</h2>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                <p className="font-semibold text-gray-900">User Management</p>
                <p className="text-sm text-gray-600">Manage customers, tailors, and admin accounts</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                <p className="font-semibold text-gray-900">Order Oversight</p>
                <p className="text-sm text-gray-600">Monitor all platform orders and transactions</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer">
                <p className="font-semibold text-gray-900">Dispute Resolution</p>
                <p className="text-sm text-gray-600">Manage and resolve customer-tailor disputes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-900 font-medium">Database</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-900 font-medium">API Server</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-900 font-medium">Real-time Services</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
