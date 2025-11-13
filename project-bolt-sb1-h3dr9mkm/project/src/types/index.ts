export type UserRole = 'customer' | 'tailor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  profile_image_url?: string;
  bio?: string;
  preferred_style?: string;
  budget_preference?: string;
  created_at: string;
  updated_at: string;
}

export interface TailorProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  profile_image_url?: string;
  business_image_url?: string;
  bio?: string;
  specializations: string[];
  experience_years?: number;
  rating: number;
  total_orders: number;
  total_customers: number;
  is_verified: boolean;
  service_radius_km: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  tailor_id: string;
  status: OrderStatus;
  total_amount: number;
  advance_paid: number;
  final_paid: number;
  delivery_address?: string;
  delivery_date_estimate?: string;
  actual_delivery_date?: string;
  notes?: string;
  design_references: string[];
  measurement_id?: string;
  created_at: string;
  updated_at: string;
  rejected_reason?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  garment_type: string;
  fabric_type?: string;
  color?: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  design_model_id?: string;
  created_at: string;
}

export interface Measurement {
  id: string;
  customer_id: string;
  height_cm?: number;
  bust_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  shoulder_cm?: number;
  arm_length_cm?: number;
  inseam_cm?: number;
  chest_cm?: number;
  neck_cm?: number;
  notes?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface DesignModel {
  id: string;
  name: string;
  description?: string;
  category: string;
  garment_type: string;
  model_url: string;
  thumbnail_url?: string;
  color_options: string[];
  size_range?: string;
  created_by?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded';
export type PaymentType = 'advance' | 'final' | 'full';

export interface Payment {
  id: string;
  order_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  customer_id: string;
  tailor_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  payment_type: PaymentType;
  created_at: string;
  updated_at: string;
  captured_at?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  tailor_id: string;
  order_id?: string;
  last_message_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'tailor';
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export type DisputeStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  order_id: string;
  customer_id: string;
  tailor_id: string;
  subject: string;
  description: string;
  status: DisputeStatus;
  priority: string;
  raised_by: 'customer' | 'tailor';
  resolution_notes?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DeliveryTracking {
  id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered';
  updated_by: string;
  created_at: string;
}

export interface TailorReview {
  id: string;
  tailor_id: string;
  customer_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
