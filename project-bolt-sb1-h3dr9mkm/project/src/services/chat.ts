import { supabase } from './supabase';
import { Conversation, Message } from '../types';

export const chatService = {
  async getOrCreateConversation(customerId: string, tailorId: string, orderId?: string) {
    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', customerId)
        .eq('tailor_id', tailorId)
        .maybeSingle();

      if (existing) {
        return existing as Conversation;
      }

      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          customer_id: customerId,
          tailor_id: tailorId,
          order_id: orderId,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return newConversation as Conversation;
    } catch (error) {
      throw error;
    }
  },

  async getConversations(userId: string, role: 'customer' | 'tailor') {
    try {
      const field = role === 'customer' ? 'customer_id' : 'tailor_id';
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq(field, userId)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    } catch (error) {
      throw error;
    }
  },

  async getConversation(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (error) throw error;
      return data as Conversation;
    } catch (error) {
      throw error;
    }
  },

  async getMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    } catch (error) {
      throw error;
    }
  },

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: 'customer' | 'tailor';
    content: string;
    attachmentUrl?: string;
  }) {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: data.senderId,
          sender_type: data.senderType,
          content: data.content,
          attachment_url: data.attachmentUrl,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', data.conversationId);

      return message as Message;
    } catch (error) {
      throw error;
    }
  },

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },

  async markMessagesAsRead(conversationId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  async closeConversation(conversationId: string) {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_active: false })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },
};
