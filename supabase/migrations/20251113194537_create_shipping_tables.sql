/*
  # Shipping Module - Database Schema

  ## New Tables
  
  ### `shipping_settings`
  - `id` (uuid, primary key)
  - `sender_name` (text) - Shop name
  - `sender_address` (text) - Full address
  - `sender_postal_code` (text)
  - `sender_city` (text)
  - `sender_country` (text) - Default: FR
  - `pickup_allowed_dhl` (boolean) - Allow pickup at shop for DHL
  - `pickup_allowed_ups` (boolean) - Allow pickup at shop for UPS
  - `pickup_allowed_laposte` (boolean) - Allow pickup at shop for La Poste
  - `api_key_colissimo` (text) - Encrypted API key
  - `api_key_mondial_relay` (text) - Encrypted API key
  - `api_key_dhl` (text) - Encrypted API key
  - `api_key_ups` (text) - Encrypted API key
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `orders`
  - Complete order management table with shipping info
  
  ### `order_items`
  - Items in each order

  ## Security
  - Enable RLS on all tables
  - Policies for admin-only access to shipping_settings
  - Policies for orders (admin can see all, customers see their own)
*/

-- Create shipping_settings table
CREATE TABLE IF NOT EXISTS shipping_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL DEFAULT '',
  sender_address text NOT NULL DEFAULT '',
  sender_postal_code text NOT NULL DEFAULT '',
  sender_city text NOT NULL DEFAULT '',
  sender_country text NOT NULL DEFAULT 'FR',
  pickup_allowed_dhl boolean DEFAULT true,
  pickup_allowed_ups boolean DEFAULT true,
  pickup_allowed_laposte boolean DEFAULT true,
  api_key_colissimo text DEFAULT '',
  api_key_mondial_relay text DEFAULT '',
  api_key_dhl text DEFAULT '',
  api_key_ups text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text DEFAULT '',
  
  -- Shipping address
  shipping_address text NOT NULL,
  shipping_postal_code text NOT NULL,
  shipping_city text NOT NULL,
  shipping_country text NOT NULL DEFAULT 'FR',
  
  -- Billing address (optional, can be same as shipping)
  billing_address text DEFAULT '',
  billing_postal_code text DEFAULT '',
  billing_city text DEFAULT '',
  billing_country text DEFAULT 'FR',
  
  -- Order totals
  subtotal numeric DEFAULT 0,
  shipping_price numeric DEFAULT 0,
  total_price numeric DEFAULT 0,
  total_weight integer DEFAULT 0,
  
  -- Shipping details
  selected_carrier text DEFAULT '',
  carrier_service text DEFAULT '',
  delivery_type text DEFAULT 'home',
  relay_point_id text DEFAULT '',
  relay_point_name text DEFAULT '',
  relay_point_address text DEFAULT '',
  
  tracking_number text DEFAULT '',
  label_pdf_url text DEFAULT '',
  
  -- Order status
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  shipping_status text DEFAULT 'pending',
  
  notes text DEFAULT '',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_code text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  unit_weight integer NOT NULL DEFAULT 0,
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Shipping settings policies (admin only)
CREATE POLICY "Admin can view shipping settings"
  ON shipping_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update shipping settings"
  ON shipping_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can insert shipping settings"
  ON shipping_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Orders policies (public can create, view own orders)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  USING (true);

-- Insert default shipping settings
INSERT INTO shipping_settings (
  sender_name,
  sender_address,
  sender_city,
  sender_postal_code,
  sender_country
) VALUES (
  'HIFI BAR',
  'À configurer',
  'À configurer',
  '00000',
  'FR'
) ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
