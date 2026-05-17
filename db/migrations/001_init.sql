-- F.R.E.S.H. Database Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'partner', 'admin')),
  avatar TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  join_date TEXT,
  last_active TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  green_points INTEGER DEFAULT 0,
  food_rescued REAL DEFAULT 0,
  co2_reduced REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0
);

-- Stores
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_open BOOLEAN DEFAULT TRUE,
  open_hours TEXT,
  distance REAL DEFAULT 0,
  deals_count INTEGER DEFAULT 0,
  image TEXT,
  since TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER NOT NULL,
  ai_price INTEGER NOT NULL,
  expiry TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'out_of_stock', 'archived')),
  image TEXT NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(id),
  store_name TEXT NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  co2_saved REAL DEFAULT 0,
  rescued_score INTEGER DEFAULT 0,
  ingredients JSONB DEFAULT '[]',
  allergens JSONB DEFAULT '[]',
  nutrition JSONB DEFAULT '{}',
  distance REAL DEFAULT 0
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  store_name TEXT NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(id),
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  service_fee INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled')),
  delivery_method TEXT DEFAULT 'delivery' CHECK (delivery_method IN ('pickup', 'delivery')),
  payment_method TEXT DEFAULT 'wallet' CHECK (payment_method IN ('momo', 'zalopay', 'vnpay', 'applepay', 'wallet')),
  created_at TEXT NOT NULL,
  estimated_delivery TEXT,
  delivered_at TEXT,
  qr_code TEXT,
  notes TEXT,
  address TEXT
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

-- Tracking Steps
CREATE TABLE IF NOT EXISTS tracking_steps (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('revenue', 'withdrawal', 'topup', 'payment', 'refund', 'commission')),
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  description TEXT NOT NULL,
  payment_method TEXT,
  reference TEXT
);

-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  branch TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TEXT NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('deal', 'order', 'voucher', 'system', 'community', 'ai')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  icon TEXT NOT NULL,
  action_url TEXT
);

-- Fraud Alerts
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  store TEXT NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('Low', 'Medium', 'High', 'Critical')),
  score INTEGER NOT NULL,
  time TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive'))
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  issue TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'escalated')),
  created_at TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('delivery', 'payment', 'product', 'account', 'technical'))
);

-- Ticket Responses
CREATE TABLE IF NOT EXISTS ticket_responses (
  id SERIAL PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id),
  from_text TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT NOT NULL
);

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL,
  approved_at TEXT
);

-- Wallet balances (on the users table)
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0;
