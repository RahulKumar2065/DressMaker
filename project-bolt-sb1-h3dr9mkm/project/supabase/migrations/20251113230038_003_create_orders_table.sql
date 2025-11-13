/*
  # Orders and Order Details Tables

  1. New Tables
    - `orders` - Main order records
    - `order_items` - Individual items in orders
    - `order_status_history` - Track order status changes
  
  2. Security
    - Enable RLS on all tables
    - Customers can view own orders
    - Tailors can view orders assigned to them
    - Admins can view all orders

  3. Description
    - orders: Main order with customer, tailor, dates, and amounts
    - order_items: Each order can have multiple items/garments
    - order_status_history: Audit trail of status changes
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'ready', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL,
  advance_paid numeric(10,2) DEFAULT 0,
  final_paid numeric(10,2) DEFAULT 0,
  delivery_address text,
  delivery_date_estimate date,
  actual_delivery_date date,
  notes text,
  design_references text[],
  measurement_id uuid REFERENCES measurements(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  rejected_reason text
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  garment_type text NOT NULL,
  fabric_type text,
  color text,
  quantity integer DEFAULT 1,
  unit_price numeric(10,2),
  notes text,
  design_model_id uuid REFERENCES design_models(id),
  created_at timestamptz DEFAULT now()
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = orders.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Tailors can view assigned orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = orders.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Tailors can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = orders.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tailor_profiles
      WHERE tailor_profiles.id = orders.tailor_id
      AND tailor_profiles.user_id = auth.uid()
    )
  );

-- Order items policies (inherit from orders)
CREATE POLICY "Users can view order items for accessible orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        (EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE customer_profiles.id = orders.customer_id
          AND customer_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM tailor_profiles
          WHERE tailor_profiles.id = orders.tailor_id
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

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND EXISTS (
        SELECT 1 FROM customer_profiles
        WHERE customer_profiles.id = orders.customer_id
        AND customer_profiles.user_id = auth.uid()
      )
    )
  );

-- Order status history policies
CREATE POLICY "Users can view status history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (
        (EXISTS (
          SELECT 1 FROM customer_profiles
          WHERE customer_profiles.id = orders.customer_id
          AND customer_profiles.user_id = auth.uid()
        ))
        OR
        (EXISTS (
          SELECT 1 FROM tailor_profiles
          WHERE tailor_profiles.id = orders.tailor_id
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

CREATE POLICY "System can insert status changes"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
    )
  );

-- Create indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_tailor_id ON orders(tailor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);
