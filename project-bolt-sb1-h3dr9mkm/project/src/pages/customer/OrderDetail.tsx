import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Order, OrderItem, Payment, DeliveryTracking } from '../../types';
import { ArrowLeft, MapPin, Phone, MessageSquare } from 'lucide-react';

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tracking, setTracking] = useState<DeliveryTracking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchData = async () => {
      try {
        const [orderRes, itemsRes, paymentsRes, trackingRes] = await Promise.all([
          supabase.from('orders').select('*').eq('id', orderId).maybeSingle(),
          supabase.from('order_items').select('*').eq('order_id', orderId),
          supabase.from('payments').select('*').eq('order_id', orderId),
          supabase.from('delivery_tracking').select('*').eq('order_id', orderId).order('created_at', { ascending: false }),
        ]);

        if (orderRes.data) setOrder(orderRes.data);
        if (itemsRes.data) setItems(itemsRes.data);
        if (paymentsRes.data) setPayments(paymentsRes.data);
        if (trackingRes.data) setTracking(trackingRes.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const statusColors: { [key: string]: string } = {
    pending: 'yellow',
    accepted: 'blue',
    in_progress: 'blue',
    ready: 'green',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
  };

  const color = statusColors[order.status] || 'gray';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
              <p className="text-gray-600 mt-1">Placed {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-white font-semibold bg-${color}-600`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-gray-600 text-sm mb-1">Order Total</p>
              <p className="text-3xl font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Advance Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{order.advance_paid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Final Payment Due</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{(order.total_amount - order.advance_paid - order.final_paid).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.garment_type} ({item.quantity}x)
                    </span>
                    <span className="font-semibold text-gray-900">₹{(item.unit_price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery</h3>
              {order.delivery_date_estimate && (
                <p className="text-sm text-gray-600 mb-2">
                  Estimated: {new Date(order.delivery_date_estimate).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-gray-900">{order.delivery_address}</p>
              {order.actual_delivery_date && (
                <p className="text-sm text-green-600 mt-2">
                  Delivered: {new Date(order.actual_delivery_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/chat/${orderId}`)}
            className="mt-6 flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition justify-center"
          >
            <MessageSquare size={20} />
            Chat with Tailor
          </button>
        </div>

        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)} Payment
                    </p>
                    <p className="text-sm text-gray-600">{payment.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tracking.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Tracking</h2>
            <div className="space-y-4">
              {tracking.map((track, idx) => (
                <div key={track.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    {idx < tracking.length - 1 && <div className="w-1 h-12 bg-blue-300"></div>}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold text-gray-900 capitalize">{track.status}</p>
                    <p className="text-sm text-gray-600">{track.address}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(track.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
