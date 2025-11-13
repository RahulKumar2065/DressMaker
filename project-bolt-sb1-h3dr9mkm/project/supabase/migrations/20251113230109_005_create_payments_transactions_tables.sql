/*
  # Payments and Transactions Tables

  1. New Tables
    - `payments` - Payment transactions
    - `refunds` - Refund records
  
  2. Security
    - Enable RLS on all tables
    - Customers can view own payments
    - Tailors can view payments for their orders
    - Admins can view all payments

  3. Description
    - payments: Razorpay payment records
    - refunds: Refund request and processing records
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_payment_id text UNIQUE,
  razorpay_order_id text,
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  payment_method text,
  payment_type text CHECK (payment_type IN ('advance', 'final', 'full')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  captured_at timestamptz
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_refund_id text,
  amount numeric(10,2) NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  notes text
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = payments.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Tailors can view payments for their orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = payments.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Refunds policies
CREATE POLICY "Participants can view refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = refunds.payment_id
      AND (
        (EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE customer_profiles.id = payments.customer_id
          AND customer_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM tailor_profiles
          WHERE tailor_profiles.id = payments.tailor_id
          AND tailor_profiles.user_id = auth.uid()
        ))
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert refunds"
  ON refunds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update refunds"
  ON refunds FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_tailor_id ON payments(tailor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);
