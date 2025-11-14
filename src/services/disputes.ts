import { supabase } from './supabase';
import { Dispute } from '../types';

export const disputeService = {
  async createDispute(data: {
    orderId: string;
    customerId: string;
    tailorId: string;
    subject: string;
    description: string;
    raisedBy: 'customer' | 'tailor';
  }) {
    try {
      const { data: dispute, error } = await supabase
        .from('disputes')
        .insert({
          order_id: data.orderId,
          customer_id: data.customerId,
          tailor_id: data.tailorId,
          subject: data.subject,
          description: data.description,
          raised_by: data.raisedBy,
          status: 'open',
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return dispute as Dispute;
    } catch (error) {
      throw error;
    }
  },

  async getDisputes(userId: string, role: 'customer' | 'tailor' | 'admin') {
    try {
      let query = supabase.from('disputes').select('*');

      if (role === 'customer') {
        query = query.eq('customer_id', userId);
      } else if (role === 'tailor') {
        query = query.eq('tailor_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Dispute[];
    } catch (error) {
      throw error;
    }
  },

  async getDispute(disputeId: string) {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', disputeId)
        .maybeSingle();

      if (error) throw error;
      return data as Dispute;
    } catch (error) {
      throw error;
    }
  },

  async updateDisputeStatus(disputeId: string, status: string, resolutionNotes?: string) {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .update({
          status,
          resolution_notes: resolutionNotes,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', disputeId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as Dispute;
    } catch (error) {
      throw error;
    }
  },

  async addDisputeMessage(data: {
    disputeId: string;
    senderId: string;
    senderType: 'customer' | 'tailor' | 'admin';
    content: string;
  }) {
    try {
      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: data.disputeId,
          sender_id: data.senderId,
          sender_type: data.senderType,
          content: data.content,
        });

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  async getDisputeMessages(disputeId: string) {
    try {
      const { data, error } = await supabase
        .from('dispute_messages')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },
};
