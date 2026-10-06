-- ==================================================================================
-- SUPPLEMENT FACTORY SRI LANKA - DATABASE SCHEMA & FUNCTIONS
-- PostgreSQL / Supabase with Row Level Security (RLS) & Real-time
-- ==================================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Objects (if resetting)
DROP TABLE IF EXISTS affiliate_payouts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- 3. Custom Types
CREATE TYPE order_status AS ENUM (
  'AWAITING_SLIP',
  'CONFIRMED',
  'SHIPPED',
  'EXPIRED',
  'CANCELLED',
  'awaiting_payment',
  'confirmed',
  'shipped',
  'cancelled',
  'expired'
);

-- ==================================================================================
-- 4. PRODUCTS TABLE
-- Inventory tracking with Available-To-Promise (ATP): available = stock - reserved_stock
-- ==================================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  flavor VARCHAR(100),
  size_weight VARCHAR(50),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  reserved_stock INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  description TEXT,
  nutrition_facts JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  badge VARCHAR(50) DEFAULT 'HOT SELLER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_reserved_not_exceed_stock CHECK (reserved_stock <= stock)
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ==================================================================================
-- 5. AFFILIATES / TRAINERS TABLE
-- Tracks local gym coaches, discount promo codes, and commissions
-- ==================================================================================
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional link to Supabase Auth
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  trainer_name VARCHAR(150) NOT NULL,
  gym_name VARCHAR(150),
  promo_code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  total_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_earnings >= 0),
  unpaid_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unpaid_balance >= 0),
  phone VARCHAR(25) NOT NULL,
  bank_name VARCHAR(100),
  bank_branch VARCHAR(100),
  bank_account_no VARCHAR(50),
  bank_account_name VARCHAR(150),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliates_promo_code ON affiliates(LOWER(promo_code));

-- ==================================================================================
-- 6. AFFILIATE PAYOUTS TABLE (GIVE OUTS / SETTLEMENTS)
-- Tracks historical commissions paid out to local gym trainers
-- ==================================================================================
CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  bank_reference VARCHAR(100) NOT NULL,
  bank_name VARCHAR(100),
  bank_account_no VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_created_at ON affiliate_payouts(created_at);

-- ==================================================================================
-- 6B. STAFF USERS & ROLE-BASED PRIVILEGES (RBAC) TABLE
-- Tracks management, finance, and dispatch staff accounts
-- ==================================================================================
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'DISPATCH_STAFF' CHECK (role IN ('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'FINANCE', 'DISPATCH_STAFF')),
  phone VARCHAR(25),
  is_active BOOLEAN NOT NULL DEFAULT true,
  privileges JSONB NOT NULL DEFAULT '{"can_approve_bank_changes": false, "can_process_payouts": false, "can_manage_inventory": true, "can_manage_staff": false, "can_verify_orders": true, "can_view_financials": false}'::jsonb,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_users_role ON staff_users(role);
CREATE INDEX idx_staff_users_email ON staff_users(email);

-- ==================================================================================
-- 6C. TRAINER BANK ACCOUNT CHANGE REQUESTS (APPROVAL QUEUE)
-- Sensitive changes require review and authorization by Admin or Operations Manager
-- ==================================================================================
CREATE TABLE trainer_bank_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  current_bank_name VARCHAR(100),
  current_bank_branch VARCHAR(100),
  current_bank_account_no VARCHAR(50),
  current_bank_account_name VARCHAR(150),
  requested_bank_name VARCHAR(100) NOT NULL,
  requested_bank_branch VARCHAR(100) NOT NULL,
  requested_bank_account_no VARCHAR(50) NOT NULL,
  requested_bank_account_name VARCHAR(150) NOT NULL,
  requested_phone VARCHAR(25),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES staff_users(id),
  reviewed_by_name VARCHAR(150),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trainer_bank_requests_affiliate ON trainer_bank_change_requests(affiliate_id);
CREATE INDEX idx_trainer_bank_requests_status ON trainer_bank_change_requests(status);

-- ==================================================================================
-- 7. ORDERS TABLE
-- 4-hour reservation window for WhatsApp Bank Transfer checkout
-- ==================================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  customer_details JSONB NOT NULL DEFAULT '{}'::jsonb, 
  -- Example: {"name": "Kamal Perera", "phone": "+94771234567", "email": "kamal@gmail.com", "address": "No 42, Galle Road", "city": "Colombo 03", "district": "Colombo"}
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status order_status NOT NULL DEFAULT 'AWAITING_SLIP',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer_whatsapp',
  applied_promo_code VARCHAR(50),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
  affiliate_commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (affiliate_commission_amount >= 0),
  bank_slip_url TEXT,
  whatsapp_uri TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours'),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_affiliate_id ON orders(affiliate_id);
CREATE INDEX idx_orders_expires_at ON orders(expires_at);

-- ==================================================================================
-- 7. ORDER ITEMS TABLE
-- ==================================================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  sku VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ==================================================================================
-- 8. ATOMIC STORED PROCEDURES / RPC FUNCTIONS
-- ==================================================================================

-- Function: Create order, validate stock Available-to-Promise, reserve inventory for 4h
CREATE OR REPLACE FUNCTION create_order_with_reservation(
  p_customer_details JSONB,
  p_items JSONB, -- Array of objects: [{"product_id": "...", "quantity": 1}]
  p_promo_code VARCHAR(50) DEFAULT NULL,
  p_delivery_fee NUMERIC(10,2) DEFAULT 0.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item JSONB;
  v_product RECORD;
  v_order_id UUID;
  v_order_number VARCHAR(50);
  v_subtotal NUMERIC(10,2) := 0.00;
  v_discount NUMERIC(10,2) := 0.00;
  v_total NUMERIC(10,2) := 0.00;
  v_affiliate RECORD;
  v_affiliate_id UUID := NULL;
  v_commission_amount NUMERIC(10,2) := 0.00;
  v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '4 hours';
BEGIN
  -- 1. Validate Items Array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- 2. Check Promo Code / Affiliate
  IF p_promo_code IS NOT NULL AND TRIM(p_promo_code) <> '' THEN
    SELECT * INTO v_affiliate FROM affiliates 
    WHERE LOWER(promo_code) = LOWER(TRIM(p_promo_code)) AND is_active = true;
    
    IF FOUND THEN
      v_affiliate_id := v_affiliate.id;
    END IF;
  END IF;

  -- 3. Validate Stock & Lock Rows (ATP = stock - reserved_stock)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM products 
    WHERE id = (v_item->>'product_id')::UUID 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found.', (v_item->>'product_id');
    END IF;

    IF (v_product.stock - v_product.reserved_stock) < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient available stock for %. Requested: %, Available: %',
        v_product.name, 
        (v_item->>'quantity')::INTEGER, 
        (v_product.stock - v_product.reserved_stock);
    END IF;

    v_subtotal := v_subtotal + (v_product.price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  -- 4. Calculate Discounts and Commissions
  IF v_affiliate_id IS NOT NULL THEN
    v_discount := ROUND((v_subtotal * (v_affiliate.discount_percent / 100.0)), 2);
    v_commission_amount := ROUND(((v_subtotal - v_discount) * (v_affiliate.commission_rate / 100.0)), 2);
  END IF;

  v_total := (v_subtotal - v_discount) + p_delivery_fee;
  v_order_number := 'SF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

  -- 5. Insert Order
  INSERT INTO orders (
    order_number,
    customer_details,
    subtotal,
    discount_amount,
    delivery_fee,
    total_amount,
    status,
    applied_promo_code,
    affiliate_id,
    affiliate_commission_amount,
    expires_at
  ) VALUES (
    v_order_number,
    p_customer_details,
    v_subtotal,
    v_discount,
    p_delivery_fee,
    v_total,
    'awaiting_payment',
    p_promo_code,
    v_affiliate_id,
    v_commission_amount,
    v_expires_at
  ) RETURNING id INTO v_order_id;

  -- 6. Insert Order Items & Increment reserved_stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;
    
    INSERT INTO order_items (
      order_id,
      product_id,
      sku,
      product_name,
      unit_price,
      quantity,
      subtotal
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.sku,
      v_product.name,
      v_product.price,
      (v_item->>'quantity')::INTEGER,
      (v_product.price * (v_item->>'quantity')::INTEGER)
    );

    UPDATE products 
    SET reserved_stock = reserved_stock + (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = v_product.id;
  END LOOP;

  -- 7. Return Result Payload
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_total,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'expires_at', v_expires_at,
    'applied_promo_code', p_promo_code,
    'affiliate_id', v_affiliate_id
  );
END;
$$;

-- Function: Approve Payment (Deducts stock permanently, settles reservation, credits trainer)
CREATE OR REPLACE FUNCTION approve_order_payment(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- 1. Fetch & Lock Order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF v_order.status <> 'awaiting_payment' THEN
    RAISE EXCEPTION 'Order is not awaiting payment. Current status: %', v_order.status;
  END IF;

  -- 2. Deduct Physical Inventory & Release Reserved Stock
  FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id
  LOOP
    UPDATE products
    SET stock = stock - v_item.quantity,
        reserved_stock = reserved_stock - v_item.quantity,
        updated_at = NOW()
    WHERE id = v_item.product_id;
  END LOOP;

  -- 3. Credit Trainer Affiliate Balance (if affiliate assigned)
  IF v_order.affiliate_id IS NOT NULL AND v_order.affiliate_commission_amount > 0 THEN
    UPDATE affiliates
    SET total_earnings = total_earnings + v_order.affiliate_commission_amount,
        unpaid_balance = unpaid_balance + v_order.affiliate_commission_amount,
        updated_at = NOW()
    WHERE id = v_order.affiliate_id;
  END IF;

  -- 4. Mark Order Confirmed (Ready to Ship)
  UPDATE orders
  SET status = 'confirmed',
      confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', 'confirmed',
    'credited_affiliate_id', v_order.affiliate_id,
    'commission_amount', v_order.affiliate_commission_amount
  );
END;
$$;

-- ==================================================================================
-- AUTOMATED TRIGGER: Listen for status update to 'CONFIRMED'
-- Finalizes inventory deduction and adds affiliate commission automatically
-- ==================================================================================
CREATE OR REPLACE FUNCTION trg_handle_order_status_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- When order status changes to CONFIRMED (from AWAITING_SLIP / awaiting_payment)
  IF (NEW.status IN ('CONFIRMED', 'confirmed') AND (OLD.status NOT IN ('CONFIRMED', 'confirmed'))) THEN
    
    -- 1. Deduct stock physically and clear reserved_stock
    FOR v_item IN SELECT * FROM order_items WHERE order_id = NEW.id
    LOOP
      UPDATE products
      SET stock = GREATEST(0, stock - v_item.quantity),
          reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
          updated_at = NOW()
      WHERE id = v_item.product_id;
    END LOOP;

    -- 2. Credit the Trainer Affiliate Commission Balance
    IF NEW.affiliate_id IS NOT NULL AND NEW.affiliate_commission_amount > 0 THEN
      UPDATE affiliates
      SET total_earnings = total_earnings + NEW.affiliate_commission_amount,
          unpaid_balance = unpaid_balance + NEW.affiliate_commission_amount,
          updated_at = NOW()
      WHERE id = NEW.affiliate_id;
    END IF;

    NEW.confirmed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_confirmed ON orders;
CREATE TRIGGER trg_order_status_confirmed
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trg_handle_order_status_confirmed();

-- Function: Release Expired 4-Hour Reservations (Cron / automated trigger)
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_order IN 
    SELECT * FROM orders 
    WHERE status = 'awaiting_payment' AND expires_at < NOW()
    FOR UPDATE
  LOOP
    -- Revert reserved_stock on products
    FOR v_item IN SELECT * FROM order_items WHERE order_id = v_order.id
    LOOP
      UPDATE products
      SET reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
          updated_at = NOW()
      WHERE id = v_item.product_id;
    END LOOP;

    -- Mark order expired
    UPDATE orders 
    SET status = 'expired', 
        updated_at = NOW() 
    WHERE id = v_order.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Function: Process / Record Trainer Affiliate Payout (Give Out)
CREATE OR REPLACE FUNCTION process_affiliate_payout(
  p_affiliate_id UUID,
  p_amount NUMERIC(12, 2),
  p_bank_reference VARCHAR(100),
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_affiliate RECORD;
  v_payout_id UUID;
BEGIN
  -- 1. Validate & Lock Affiliate
  SELECT * INTO v_affiliate FROM affiliates WHERE id = p_affiliate_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trainer affiliate with ID % not found.', p_affiliate_id;
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payout amount must be greater than zero.';
  END IF;

  IF v_affiliate.unpaid_balance < p_amount THEN
    RAISE EXCEPTION 'Payout amount (LKR %) exceeds unpaid balance (LKR %).', p_amount, v_affiliate.unpaid_balance;
  END IF;

  -- 2. Insert Payout Record
  INSERT INTO affiliate_payouts (
    affiliate_id,
    amount,
    bank_reference,
    bank_name,
    bank_account_no,
    notes,
    status
  ) VALUES (
    v_affiliate.id,
    p_amount,
    p_bank_reference,
    v_affiliate.bank_name,
    v_affiliate.bank_account_no,
    p_notes,
    'completed'
  ) RETURNING id INTO v_payout_id;

  -- 3. Deduct Unpaid Balance
  UPDATE affiliates
  SET unpaid_balance = unpaid_balance - p_amount,
      updated_at = NOW()
  WHERE id = v_affiliate.id;

  RETURN jsonb_build_object(
    'success', true,
    'payout_id', v_payout_id,
    'affiliate_id', v_affiliate.id,
    'trainer_name', v_affiliate.trainer_name,
    'payout_amount', p_amount,
    'remaining_unpaid_balance', (v_affiliate.unpaid_balance - p_amount),
    'bank_reference', p_bank_reference
  );
END;
$$;

-- Function: Restock / Adjust Central Warehouse Product Inventory
CREATE OR REPLACE FUNCTION restock_product(
  p_product_id UUID,
  p_quantity_to_add INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock INTEGER;
BEGIN
  IF p_quantity_to_add = 0 THEN
    RAISE EXCEPTION 'Restock quantity cannot be zero.';
  END IF;

  UPDATE products
  SET stock = GREATEST(0, stock + p_quantity_to_add),
      updated_at = NOW()
  WHERE id = p_product_id
  RETURNING stock INTO v_new_stock;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found.', p_product_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'new_stock', v_new_stock
  );
END;
$$;

-- ==================================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Affiliate Payouts: Trainers can view own payouts; Admin manages all
CREATE POLICY "Trainers can view own payouts" 
  ON affiliate_payouts FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin full access to payouts" 
  ON affiliate_payouts FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%admin%'
  );

-- Products: Everyone can read active products, Admin can modify
CREATE POLICY "Public can view active products" 
  ON products FOR SELECT USING (is_active = true);

CREATE POLICY "Admin full access to products" 
  ON products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%admin%');

-- Affiliates: Trainers can read their own profile, Public can verify promo_code via RPC, Admin manages all
CREATE POLICY "Trainers can view own profile" 
  ON affiliates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to affiliates" 
  ON affiliates FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%admin%');

-- Orders: Public can create orders (or via RPC); users/trainers read scoped; admin reads all
CREATE POLICY "Public can insert orders" 
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Trainers can view referred orders" 
  ON orders FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin full access to orders" 
  ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%admin%');

-- Order Items:
CREATE POLICY "Public can insert order items" 
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Public view order items of own orders" 
  ON order_items FOR SELECT USING (true);

-- ==================================================================================
-- 10. REALTIME CONFIGURATION
-- ==================================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ==================================================================================
-- 11. INITIAL SEED DATA (Sri Lanka Supplement Factory Market)
-- ==================================================================================
INSERT INTO products (sku, name, slug, category, flavor, size_weight, price, cost_price, stock, reserved_stock, description, badge, image_url)
VALUES
(
  'SF-ISO-CHOCO',
  'APEX 100% HYDROLYZED WHEY ISOLATE',
  'apex-hydrolyzed-whey-isolate',
  'Protein',
  'Dark Belgian Chocolate',
  '5.0 lbs (2.27 kg)',
  34500.00,
  22000.00,
  25,
  2,
  'Ultra-pure cross-flow micro-filtered whey isolate. 28g Protein, 6.2g BCAAs, zero sugar. Ultra-rapid absorption formulated for peak lean muscle hypertrophy in tropical climates.',
  'BESTSELLER',
  'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80'
),
(
  'SF-PRE-VOLT',
  'ANARCHY HIGH-STIM PRE-WORKOUT',
  'anarchy-high-stim-pre-workout',
  'Pre-Workout',
  'Electric Blue Razz',
  '40 Servings (400g)',
  18500.00,
  11000.00,
  40,
  5,
  'Explosive clinical formula engineered with 400mg Caffeine Anhydrous, 6000mg L-Citrulline Malate, and 3200mg Beta-Alanine for laser focus and skin-tearing vascular pumps.',
  'HARDCORE STIM',
  'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80'
),
(
  'SF-CREA-MICRO',
  'MICRONIZED CREATINE MONOHYDRATE 200 MESH',
  'micronized-creatine-monohydrate',
  'Performance',
  'Unflavored Pure',
  '100 Servings (500g)',
  14500.00,
  7800.00,
  60,
  4,
  '100% pure pharmaceutical grade Creapure® micronized to 200 mesh for maximum solubility and cellular ATP saturation.',
  'ESSENTIAL',
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80'
),
(
  'SF-MASS-MONSTER',
  'TITAN ANABOLIC HEAVYWEIGHT GAINER',
  'titan-anabolic-mass-gainer',
  'Mass Gainer',
  'Vanilla Caramel Swirl',
  '12.0 lbs (5.44 kg)',
  28900.00,
  17500.00,
  18,
  1,
  '1250 clean calories, 65g multi-stage protein matrix, complex carb fuel from rolled oats and sweet potato. No bloating.',
  'HIGH CALORIE',
  'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=800&q=80'
);

-- Seed Local Sri Lankan Trainers / Affiliates
INSERT INTO affiliates (email, password_hash, trainer_name, gym_name, promo_code, discount_percent, commission_rate, total_earnings, unpaid_balance, phone, bank_name, bank_branch, bank_account_no, bank_account_name)
VALUES
(
  'aqil@supplementfactory.lk',
  'coach123',
  'Aqil Rahuman',
  'High Octane Fitness (Colombo 07)',
  'TRAINER-AQIL10',
  5.00,
  10.00,
  145000.00,
  38500.00,
  '+94772891234',
  'Commercial Bank of Ceylon',
  'Kollupitiya',
  '8001928374',
  'A M Aqil Rahuman'
),
(
  'shehan@supplementfactory.lk',
  'coach123',
  'Shehan Fernando',
  'Power World Gyms (Nugegoda)',
  'COACH-SHEHAN',
  5.00,
  10.00,
  98000.00,
  24000.00,
  '+94713456789',
  'Sampath Bank',
  'Nugegoda Super Grade',
  '002345678912',
  'K S Fernando'
);

-- Seed Internal Staff Users with Granular Privileges (RBAC)
INSERT INTO staff_users (name, email, role, phone, is_active, privileges)
VALUES
(
  'Roshan Perera',
  'roshan@supplementfactory.lk',
  'SUPER_ADMIN',
  '+94771122334',
  true,
  '{"can_approve_bank_changes": true, "can_process_payouts": true, "can_manage_inventory": true, "can_manage_staff": true, "can_verify_orders": true, "can_view_financials": true}'::jsonb
),
(
  'Dilshan Wickrama',
  'dilshan@supplementfactory.lk',
  'OPERATIONS_MANAGER',
  '+94773344556',
  true,
  '{"can_approve_bank_changes": true, "can_process_payouts": true, "can_manage_inventory": true, "can_manage_staff": false, "can_verify_orders": true, "can_view_financials": true}'::jsonb
),
(
  'Kavindi Silva',
  'kavindi@supplementfactory.lk',
  'FINANCE',
  '+94715566778',
  true,
  '{"can_approve_bank_changes": true, "can_process_payouts": true, "can_manage_inventory": false, "can_manage_staff": false, "can_verify_orders": true, "can_view_financials": true}'::jsonb
),
(
  'Asanka Bandara',
  'asanka@supplementfactory.lk',
  'DISPATCH_STAFF',
  '+94767788990',
  true,
  '{"can_approve_bank_changes": false, "can_process_payouts": false, "can_manage_inventory": true, "can_manage_staff": false, "can_verify_orders": true, "can_view_financials": false}'::jsonb
);

-- RPC: Approve Trainer Bank Change Request
CREATE OR REPLACE FUNCTION approve_trainer_bank_change(
  p_request_id UUID,
  p_staff_name VARCHAR(150) DEFAULT 'Operations Manager'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req trainer_bank_change_requests%ROWTYPE;
BEGIN
  SELECT * INTO v_req
  FROM trainer_bank_change_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request with ID % not found.', p_request_id;
  END IF;

  IF v_req.status != 'PENDING' THEN
    RAISE EXCEPTION 'Request has already been processed.';
  END IF;

  -- 1. Update Affiliate live bank details
  UPDATE affiliates
  SET bank_name = v_req.requested_bank_name,
      bank_branch = v_req.requested_bank_branch,
      bank_account_no = v_req.requested_bank_account_no,
      bank_account_name = v_req.requested_bank_account_name,
      phone = COALESCE(v_req.requested_phone, phone),
      updated_at = NOW()
  WHERE id = v_req.affiliate_id;

  -- 2. Mark request as APPROVED
  UPDATE trainer_bank_change_requests
  SET status = 'APPROVED',
      reviewed_by_name = p_staff_name,
      reviewed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'affiliate_id', v_req.affiliate_id,
    'status', 'APPROVED'
  );
END;
$$;

-- ==================================================================================
-- 10. INVENTORY RESTOCK BATCHES TABLE
-- Logs batch-specific unit landed cost, selling price updates, and consignment origin
-- ==================================================================================
CREATE TABLE IF NOT EXISTS inventory_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_added INTEGER NOT NULL CHECK (quantity_added > 0),
  unit_cost_price NUMERIC(10, 2) NOT NULL CHECK (unit_cost_price >= 0),
  total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_added * unit_cost_price) STORED,
  selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
  batch_number VARCHAR(100),
  supplier_name VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_batches_product_id ON inventory_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_created_at ON inventory_batches(created_at DESC);

ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read inventory_batches"
  ON inventory_batches FOR SELECT
  USING (true);

CREATE POLICY "Service and authenticated insert inventory_batches"
  ON inventory_batches FOR INSERT
  WITH CHECK (true);

-- RPC: Restock Product with Batch Landed Cost & Selling Price
CREATE OR REPLACE FUNCTION restock_product_batch(
  p_product_id UUID,
  p_quantity_to_add INTEGER,
  p_unit_cost_price NUMERIC(10, 2),
  p_new_selling_price NUMERIC(10, 2) DEFAULT NULL,
  p_batch_number VARCHAR(100) DEFAULT NULL,
  p_supplier_name VARCHAR(150) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock INTEGER;
  v_batch_id UUID;
  v_selling_price NUMERIC(10, 2);
BEGIN
  IF p_quantity_to_add <= 0 THEN
    RAISE EXCEPTION 'Restock quantity must be greater than zero.';
  END IF;

  SELECT price INTO v_selling_price FROM products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found.', p_product_id;
  END IF;

  IF p_new_selling_price IS NOT NULL AND p_new_selling_price > 0 THEN
    v_selling_price := p_new_selling_price;
  END IF;

  -- 1. Insert Batch Record
  INSERT INTO inventory_batches (
    product_id,
    quantity_added,
    unit_cost_price,
    selling_price,
    batch_number,
    supplier_name,
    notes
  ) VALUES (
    p_product_id,
    p_quantity_to_add,
    p_unit_cost_price,
    v_selling_price,
    p_batch_number,
    p_supplier_name,
    p_notes
  ) RETURNING id INTO v_batch_id;

  -- 2. Update Product physical stock, cost_price, and price
  UPDATE products
  SET stock = stock + p_quantity_to_add,
      cost_price = p_unit_cost_price,
      price = v_selling_price,
      updated_at = NOW()
  WHERE id = p_product_id
  RETURNING stock INTO v_new_stock;

  RETURN jsonb_build_object(
    'success', true,
    'batch_id', v_batch_id,
    'product_id', p_product_id,
    'new_stock', v_new_stock,
    'unit_cost_price', p_unit_cost_price,
    'selling_price', v_selling_price
  );
END;
$$;

