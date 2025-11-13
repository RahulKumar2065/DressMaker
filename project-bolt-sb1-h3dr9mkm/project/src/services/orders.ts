import { supabase } from './supabase';
import { Order, OrderItem, OrderStatus } from '../types';

export const orderService = {
  async createOrder(data: {
    customerId: string;
    tailorId: string;
    totalAmount: number;
    deliveryAddress: string;
    measurementId?: string;
    items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[];
  }) {
    try {
      const orderNumber = `ORD-${Date.now()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: data.customerId,
          tailor_id: data.tailorId,
          total_amount: data.totalAmount,
          delivery_address: data.deliveryAddress,
          measurement_id: data.measurementId,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order creation failed');

      const itemsWithOrderId = data.items.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

      if (itemsError) throw itemsError;

      await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: 'pending',
          notes: 'Order placed',
        });

      return order as Order;
    } catch (error) {
      throw error;
    }
  },

  async getOrder(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      throw error;
    }
  },

  async getOrderItems(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data as OrderItem[];
    } catch (error) {
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (error) throw error;

      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status,
          changed_by: (await supabase.auth.getUser()).data.user?.id,
          notes,
        });

      return data as Order;
    } catch (error) {
      throw error;
    }
  },

  async getCustomerOrders(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    } catch (error) {
      throw error;
    }
  },

  async getTailorOrders(tailorId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tailor_id', tailorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    } catch (error) {
      throw error;
    }
  },

  async acceptOrder(orderId: string) {
    return this.updateOrderStatus(orderId, 'accepted', 'Order accepted by tailor');
  },

  async rejectOrder(orderId: string, reason: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          rejected_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (error) throw error;

      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: 'rejected',
          notes: reason,
        });

      return data as Order;
    } catch (error) {
      throw error;
    }
  },

  async completeOrder(orderId: string) {
    return this.updateOrderStatus(orderId, 'delivered');
  },
};
