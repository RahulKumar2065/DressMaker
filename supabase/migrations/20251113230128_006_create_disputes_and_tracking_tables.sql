/*
  # Disputes and Delivery Tracking Tables

  1. New Tables
    - `disputes` - Dispute records between customers and tailors
    - `dispute_messages` - Communication within disputes
    - `delivery_tracking` - Real-time delivery location updates
  
  2. Security
    - Enable RLS on all tables
    - Participants can view disputes
    - Admins can manage disputes
    - Only tailor can update delivery tracking

  3. Description
    - disputes: Conflict resolution between parties
    - dispute_messages: Messages exchanged during dispute resolution
    - delivery_tracking: GPS coordinates and delivery status
*/

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  raised_by text NOT NULL CHECK (raised_by IN ('customer', 'tailor')),
  resolution_notes text,
  resolved_by uuid REFERENCES admin_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create dispute messages table
CREATE TABLE IF NOT EXISTS dispute_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'tailor', 'admin')),
  content text NOT NULL,
  attachment_url text,
  created_at timestamptz DEFAULT now()
);

-- Create delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(10,8) NOT NULL,
  address text,
  status text DEFAULT 'in_transit' CHECK (status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered')),
  updated_by uuid NOT NULL REFERENCES tailor_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Disputes policies
CREATE POLICY "Participants can view disputes"
  ON disputes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = disputes.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = disputes.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    (EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    ))
    OR
    (EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = tailor_id
      AND tailor_profiles.user_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Dispute messages policies
CREATE POLICY "Participants can view dispute messages"
  ON dispute_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_messages.dispute_id
      AND (
        (EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE customer_profiles.id = disputes.customer_id
          AND customer_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM tailor_profiles
          WHERE tailor_profiles.id = disputes.tailor_id
          AND tailor_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM admin_profiles
          WHERE admin_profiles.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Participants can send messages"
  ON dispute_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_id
    )
  );

-- Delivery tracking policies
CREATE POLICY "Customers can view own delivery tracking"
  ON delivery_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_tracking.order_id
      AND EXISTS (
        SELECT 1 FROM customer_profiles
        WHERE customer_profiles.id = orders.customer_id
        AND customer_profiles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Tailors can view and update tracking"
  ON delivery_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = delivery_tracking.order_id
      AND EXISTS (
        SELECT 1 FROM tailor_profiles
        WHERE tailor_profiles.id = orders.tailor_id
        AND tailor_profiles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all tracking"
  ON delivery_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Tailors can insert tracking updates"
  ON delivery_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND EXISTS (
        SELECT 1 FROM tailor_profiles
        WHERE tailor_profiles.id = orders.tailor_id
        AND tailor_profiles.user_id = auth.uid()
        AND tailor_profiles.id = delivery_tracking.updated_by
      )
    )
  );

CREATE POLICY "Tailors can update tracking"
  ON delivery_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = delivery_tracking.updated_by
      AND tailor_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = delivery_tracking.updated_by
      AND tailor_profiles.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_customer_id ON disputes(customer_id);
CREATE INDEX idx_disputes_tailor_id ON disputes(tailor_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at);
CREATE INDEX idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_tracking_created_at ON delivery_tracking(created_at);
