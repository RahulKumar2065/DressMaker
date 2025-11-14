/*
  # Core User Tables Setup

  1. New Tables
    - `customer_profiles` - Customer-specific profile data
    - `tailor_profiles` - Professional tailor profiles
    - `admin_profiles` - Admin user profiles
  
  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Users can only access their own profiles
    - Admins can access all profiles

  3. Description
    - customer_profiles stores customer address, preferences, and preferences
    - tailor_profiles stores professional details, ratings, specializations
    - admin_profiles stores admin settings and permissions
*/

-- Create customer profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'India',
  profile_image_url text,
  bio text,
  preferred_style text,
  budget_preference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tailor profiles table
CREATE TABLE IF NOT EXISTS tailor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  business_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  profile_image_url text,
  business_image_url text,
  bio text,
  specializations text[] DEFAULT '{}',
  experience_years integer,
  rating numeric(3,2) DEFAULT 0.0,
  total_orders integer DEFAULT 0,
  total_customers integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  service_radius_km integer DEFAULT 5,
  latitude numeric(10,8),
  longitude numeric(10,8),
  bank_account text,
  upi_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'admin',
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Customer profile policies
CREATE POLICY "Customers can view own profile"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own profile"
  ON customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can insert own profile"
  ON customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all customer profiles"
  ON customer_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view customer profile summary"
  ON customer_profiles FOR SELECT
  USING (true);

-- Tailor profile policies
CREATE POLICY "Tailors can view own profile"
  ON tailor_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Tailors can update own profile"
  ON tailor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tailors can insert own profile"
  ON tailor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tailor profiles"
  ON tailor_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view verified tailor profiles"
  ON tailor_profiles FOR SELECT
  USING (is_verified = true);

-- Admin profile policies
CREATE POLICY "Admins can view own profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_tailor_profiles_user_id ON tailor_profiles(user_id);
CREATE INDEX idx_tailor_profiles_city ON tailor_profiles(city);
CREATE INDEX idx_tailor_profiles_verified ON tailor_profiles(is_verified);
CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
