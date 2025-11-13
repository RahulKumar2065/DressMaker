/*
  # Ratings and Reviews Tables

  1. New Tables
    - `tailor_reviews` - Customer reviews for tailors
    - `order_reviews` - Order-specific reviews
  
  2. Security
    - Enable RLS on all tables
    - Customers can create reviews for completed orders
    - Public can view published reviews
    - Authors can update/delete own reviews

  3. Description
    - tailor_reviews: Overall tailor ratings and reviews
    - order_reviews: Order-specific feedback and ratings
*/

-- Create tailor reviews table
CREATE TABLE IF NOT EXISTS tailor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tailor_id uuid NOT NULL REFERENCES tailor_profiles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tailor_id, customer_id, order_id)
);

-- Create order reviews table
CREATE TABLE IF NOT EXISTS order_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  customer_rating integer CHECK (customer_rating >= 1 AND customer_rating <= 5),
  tailor_rating integer CHECK (tailor_rating >= 1 AND tailor_rating <= 5),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  overall_comment text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tailor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_reviews ENABLE ROW LEVEL SECURITY;

-- Tailor reviews policies
CREATE POLICY "Public can view published reviews"
  ON tailor_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Customers can view all reviews for tailors"
  ON tailor_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON tailor_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own reviews"
  ON tailor_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own reviews"
  ON tailor_reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

-- Order reviews policies
CREATE POLICY "Participants can view order reviews"
  ON order_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_reviews.order_id
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
      )
    )
  );

CREATE POLICY "Participants can create order reviews"
  ON order_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
    )
  );

-- Create indexes
CREATE INDEX idx_tailor_reviews_tailor_id ON tailor_reviews(tailor_id);
CREATE INDEX idx_tailor_reviews_customer_id ON tailor_reviews(customer_id);
CREATE INDEX idx_tailor_reviews_rating ON tailor_reviews(rating);
CREATE INDEX idx_tailor_reviews_published ON tailor_reviews(is_published);
CREATE INDEX idx_tailor_reviews_created_at ON tailor_reviews(created_at);
CREATE INDEX idx_order_reviews_order_id ON order_reviews(order_id);
CREATE INDEX idx_order_reviews_created_at ON order_reviews(created_at);
