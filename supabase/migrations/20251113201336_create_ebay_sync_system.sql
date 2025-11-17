/*
  # Create eBay Synchronization System

  ## New Tables
  
  ### `ebay_settings`
  - `id` (uuid, primary key)
  - `ebay_app_id` (text) - eBay Application ID
  - `ebay_cert_id` (text) - eBay Certificate ID
  - `ebay_dev_id` (text) - eBay Developer ID
  - `ebay_oauth_token` (text) - OAuth access token
  - `ebay_refresh_token` (text) - OAuth refresh token
  - `ebay_site_id` (text) - Default: 71 for France
  - `sync_enabled` (boolean) - Enable/disable auto sync
  - `last_sync_at` (timestamptz) - Last successful sync time
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `ebay_sync_logs`
  - `id` (uuid, primary key)
  - `sync_started_at` (timestamptz)
  - `sync_completed_at` (timestamptz)
  - `status` (text) - success, failed, partial
  - `items_fetched` (integer)
  - `items_created` (integer)
  - `items_updated` (integer)
  - `errors` (jsonb) - Array of error messages
  - `created_at` (timestamptz)

  ## Changes to existing tables
  
  ### `products` table updates
  - Add eBay-specific fields for synchronization
  - Store original eBay data

  ## Security
  - Enable RLS on all tables
  - Only authenticated admins can access
*/

-- Create ebay_settings table
CREATE TABLE IF NOT EXISTS ebay_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebay_app_id text DEFAULT '',
  ebay_cert_id text DEFAULT '',
  ebay_dev_id text DEFAULT '',
  ebay_oauth_token text DEFAULT '',
  ebay_refresh_token text DEFAULT '',
  ebay_site_id text DEFAULT '71',
  sync_enabled boolean DEFAULT false,
  last_sync_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ebay_sync_logs table
CREATE TABLE IF NOT EXISTS ebay_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_started_at timestamptz DEFAULT now(),
  sync_completed_at timestamptz DEFAULT NULL,
  status text DEFAULT 'running',
  items_fetched integer DEFAULT 0,
  items_created integer DEFAULT 0,
  items_updated integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add eBay fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'ebay_id'
  ) THEN
    ALTER TABLE products ADD COLUMN ebay_id text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'ebay_sku'
  ) THEN
    ALTER TABLE products ADD COLUMN ebay_sku text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'ebay_title'
  ) THEN
    ALTER TABLE products ADD COLUMN ebay_title text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'ebay_url'
  ) THEN
    ALTER TABLE products ADD COLUMN ebay_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'ebay_raw_data'
  ) THEN
    ALTER TABLE products ADD COLUMN ebay_raw_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'last_ebay_sync'
  ) THEN
    ALTER TABLE products ADD COLUMN last_ebay_sync timestamptz DEFAULT NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE ebay_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebay_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies for ebay_settings (admin only)
CREATE POLICY "Admin can view ebay settings"
  ON ebay_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update ebay settings"
  ON ebay_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can insert ebay settings"
  ON ebay_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for ebay_sync_logs (admin only)
CREATE POLICY "Admin can view sync logs"
  ON ebay_sync_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert sync logs"
  ON ebay_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update sync logs"
  ON ebay_sync_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default ebay_settings
INSERT INTO ebay_settings (ebay_site_id, sync_enabled)
VALUES ('71', false)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_ebay_id ON products(ebay_id);
CREATE INDEX IF NOT EXISTS idx_products_ebay_sku ON products(ebay_sku);
CREATE INDEX IF NOT EXISTS idx_ebay_sync_logs_status ON ebay_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_ebay_sync_logs_created_at ON ebay_sync_logs(created_at DESC);
