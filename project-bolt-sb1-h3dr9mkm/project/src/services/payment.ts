import { supabase } from './supabase';
import { Payment, PaymentStatus, PaymentType } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = {
  async initializeRazorpay() {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  async createPayment(data: {
    orderId: string;
    amount: number;
    paymentType: PaymentType;
    customerId: string;
    tailorId: string;
  }) {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          order_id: data.orderId,
          amount: data.amount,
          payment_type: data.paymentType,
          customer_id: data.customerId,
          tailor_id: data.tailorId,
          status: 'pending',
          currency: 'INR',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return payment as Payment;
    } catch (error) {
      throw error;
    }
  },

  async updatePaymentStatus(paymentId: string, status: PaymentStatus, razorpayPaymentId?: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          status,
          razorpay_payment_id: razorpayPaymentId,
          captured_at: status === 'captured' ? new Date().toISOString() : null,
        })
        .eq('id', paymentId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Payment;
    } catch (error) {
      throw error;
    }
  },

  async processRazorpayPayment(options: {
    amount: number;
    orderId: string;
    customerEmail: string;
    customerName: string;
    paymentId: string;
  }) {
    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(options.amount * 100),
        currency: 'INR',
        name: 'DressMaker',
        description: `Order ${options.orderId}`,
        order_id: options.orderId,
        handler: async (response: any) => {
          try {
            await this.updatePaymentStatus(
              options.paymentId,
              'captured',
              response.razorpay_payment_id
            );
            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    });
  },

  async getPayments(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    } catch (error) {
      throw error;
    }
  },

  async getTailorEarnings(tailorId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tailor_id', tailorId)
        .eq('status', 'captured')
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    } catch (error) {
      throw error;
    }
  },
};
