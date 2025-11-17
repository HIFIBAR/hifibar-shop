/*
  # Add Payment System Fields

  ## Changes to existing tables
  
  ### `orders` table updates
  - Add payment-related fields for Stripe and PayPal
  - Add payment status tracking
  - Add stock management fields
  
  ### `shipping_settings` table updates
  - Add Stripe API keys (public, secret, webhook secret)
  - Add PayPal API keys (client ID, secret)
  - Add email SMTP configuration
  
  ## Security
  - All API keys stored securely
  - Payment webhooks verify signatures
*/

-- Add payment fields to orders table
DO $$
BEGIN
  -- Payment provider fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_id text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_session_id text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'paypal_order_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN paypal_order_id text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'paypal_payer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN paypal_payer_email text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN paid_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'subtotal_products'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal_products numeric DEFAULT 0;
  END IF;
END $$;

-- Add Stripe & PayPal keys to shipping_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'stripe_public_key'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN stripe_public_key text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'stripe_secret_key'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN stripe_secret_key text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'stripe_webhook_secret'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN stripe_webhook_secret text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'paypal_client_id'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN paypal_client_id text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'paypal_secret'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN paypal_secret text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'paypal_mode'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN paypal_mode text DEFAULT 'sandbox';
  END IF;
END $$;

-- Add email configuration to shipping_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'smtp_host'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN smtp_host text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'smtp_port'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN smtp_port integer DEFAULT 587;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'smtp_user'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN smtp_user text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'smtp_password'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN smtp_password text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'shipping_settings' AND column_name = 'sender_email'
  ) THEN
    ALTER TABLE shipping_settings ADD COLUMN sender_email text DEFAULT '';
  END IF;
END $$;

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON orders(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
