/*
  # Measurements and Designs Tables

  1. New Tables
    - `measurements` - Virtual measurement records for customers
    - `design_models` - 3D design library with GLB/GLTF models
    - `design_inspirations` - Customer-saved design inspirations
  
  2. Security
    - Enable RLS on all tables
    - Customers can manage own measurements
    - Public can view approved designs
    - Customers can manage own inspirations

  3. Description
    - measurements: Height, bust, waist, hip, arm length, etc.
    - design_models: 3D garment models for virtual try-on
    - design_inspirations: Images or references customers save
*/

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  height_cm numeric(5,2),
  bust_cm numeric(5,2),
  waist_cm numeric(5,2),
  hip_cm numeric(5,2),
  shoulder_cm numeric(5,2),
  arm_length_cm numeric(5,2),
  inseam_cm numeric(5,2),
  chest_cm numeric(5,2),
  neck_cm numeric(5,2),
  notes text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create design models table
CREATE TABLE IF NOT EXISTS design_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  garment_type text NOT NULL,
  model_url text NOT NULL,
  thumbnail_url text,
  color_options text[] DEFAULT '{}',
  size_range text,
  created_by uuid REFERENCES tailor_profiles(id),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create design inspirations table
CREATE TABLE IF NOT EXISTS design_inspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  description text,
  garment_type text,
  saved_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_inspirations ENABLE ROW LEVEL SECURITY;

-- Measurements policies
CREATE POLICY "Customers can view own measurements"
  ON measurements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = measurements.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert own measurements"
  ON measurements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update own measurements"
  ON measurements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = measurements.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = measurements.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete own measurements"
  ON measurements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = measurements.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

-- Design models policies
CREATE POLICY "Public can view approved designs"
  ON design_models FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all designs"
  ON design_models FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update designs"
  ON design_models FOR UPDATE
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

-- Design inspirations policies
CREATE POLICY "Customers can manage own inspirations"
  ON design_inspirations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = design_inspirations.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert inspirations"
  ON design_inspirations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete inspirations"
  ON design_inspirations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customer_profiles
      WHERE customer_profiles.id = design_inspirations.customer_id
      AND customer_profiles.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_measurements_customer_id ON measurements(customer_id);
CREATE INDEX idx_design_models_category ON design_models(category);
CREATE INDEX idx_design_models_garment_type ON design_models(garment_type);
CREATE INDEX idx_design_inspirations_customer_id ON design_inspirations(customer_id);
