import { supabase } from './supabase';
import { DeliveryTracking } from '../types';

export const trackingService = {
  async updateDeliveryLocation(data: {
    orderId: string;
    latitude: number;
    longitude: number;
    address?: string;
    status: string;
    tailorId: string;
  }) {
    try {
      const { data: tracking, error } = await supabase
        .from('delivery_tracking')
        .insert({
          order_id: data.orderId,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          status: data.status,
          updated_by: data.tailorId,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return tracking as DeliveryTracking;
    } catch (error) {
      throw error;
    }
  },

  async getDeliveryTracking(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DeliveryTracking[];
    } catch (error) {
      throw error;
    }
  },

  async getLatestTracking(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DeliveryTracking;
    } catch (error) {
      throw error;
    }
  },

  subscribeToTracking(orderId: string, callback: (tracking: DeliveryTracking) => void) {
    return supabase
      .channel(`tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => callback(payload.new as DeliveryTracking)
      )
      .subscribe();
  },

  getGoogleMapsUrl(latitude: number, longitude: number) {
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3671.8449364918146!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1234567890`;
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
