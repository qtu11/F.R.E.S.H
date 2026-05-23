-- F.R.E.S.H. Full Schema v2 - Complete tables for all features

-- Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order INTEGER DEFAULT 0,
  max_discount INTEGER,
  usage_limit INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  valid_from TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
  created_at TEXT NOT NULL,
  store_id TEXT REFERENCES stores(id),
  image TEXT
);

-- User Vouchers
CREATE TABLE IF NOT EXISTS user_vouchers (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  voucher_id TEXT NOT NULL REFERENCES vouchers(id),
  claimed_at TEXT NOT NULL,
  used_at TEXT,
  order_id TEXT,
  UNIQUE(user_id, voucher_id)
);

-- Favorites / Saved Deals
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  created_at TEXT NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Campaigns (Marketing)
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('flash_sale', 'bundle', 'seasonal', 'referral', 'esg')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'cancelled')),
  discount_rate INTEGER,
  budget INTEGER DEFAULT 0,
  spent INTEGER DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  store_id TEXT REFERENCES stores(id),
  image TEXT,
  target_impressions INTEGER DEFAULT 0,
  target_conversions INTEGER DEFAULT 0,
  actual_impressions INTEGER DEFAULT 0,
  actual_conversions INTEGER DEFAULT 0
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'emerald',
  action_url TEXT,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  store_id TEXT REFERENCES stores(id)
);

-- ESG Metrics (historical tracking)
CREATE TABLE IF NOT EXISTS esg_metrics (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  food_rescued_kg REAL DEFAULT 0,
  co2_reduced_kg REAL DEFAULT 0,
  meals_saved INTEGER DEFAULT 0,
  water_saved_l REAL DEFAULT 0,
  trees_equivalent INTEGER DEFAULT 0,
  active_partners INTEGER DEFAULT 0,
  active_customers INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  UNIQUE(date)
);

-- Gamification Tiers
CREATE TABLE IF NOT EXISTS gamification_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  benefits TEXT NOT NULL,
  multiplier REAL DEFAULT 1.0
);

-- Gamification Badges
CREATE TABLE IF NOT EXISTS gamification_badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rescue', 'esg', 'social', 'milestone', 'special')),
  threshold INTEGER NOT NULL,
  tier_id TEXT REFERENCES gamification_tiers(id)
);

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  badge_id TEXT NOT NULL REFERENCES gamification_badges(id),
  earned_at TEXT NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Gamification Missions
CREATE TABLE IF NOT EXISTS gamification_missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'achievement')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL,
  icon TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TEXT NOT NULL
);

-- User Mission Progress
CREATE TABLE IF NOT EXISTS user_missions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  mission_id TEXT NOT NULL REFERENCES gamification_missions(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, mission_id)
);

-- Points History
CREATE TABLE IF NOT EXISTS points_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'expired')),
  source TEXT NOT NULL,
  reference_id TEXT,
  description TEXT,
  created_at TEXT NOT NULL
);

-- Staff Members (Partner)
CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('manager', 'staff', 'cashier')),
  permissions JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TEXT NOT NULL,
  last_active TEXT
);

-- Staff Activity Log
CREATE TABLE IF NOT EXISTS staff_activity_log (
  id SERIAL PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff_members(id),
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);

-- Role Permissions (Admin)
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- User Role Assignments
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  role_id TEXT NOT NULL REFERENCES role_permissions(id),
  UNIQUE(user_id, role_id)
);

-- Commission Rates
CREATE TABLE IF NOT EXISTS commission_rates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rate REAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  min_order INTEGER DEFAULT 0,
  max_cap INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  period TEXT NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  commission_rate REAL NOT NULL,
  commission_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  issued_at TEXT NOT NULL,
  paid_at TEXT,
  notes TEXT
);

-- Forecasting Data
CREATE TABLE IF NOT EXISTS forecasting_data (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  hour INTEGER,
  predicted_demand INTEGER,
  actual_demand INTEGER,
  confidence REAL,
  model_version TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  store_id TEXT REFERENCES stores(id)
);

-- Waste Hotspots
CREATE TABLE IF NOT EXISTS waste_hotspots (
  id TEXT PRIMARY KEY,
  district TEXT NOT NULL,
  ward TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  waste_amount REAL NOT NULL,
  food_type TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'rare')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  last_reported TEXT,
  created_at TEXT NOT NULL
);

-- District Coverage Data (Admin heatmap/growth)
CREATE TABLE IF NOT EXISTS district_coverage (
  id SERIAL PRIMARY KEY,
  district TEXT NOT NULL UNIQUE,
  coverage_pct REAL DEFAULT 0,
  total_stores INTEGER DEFAULT 0,
  active_stores INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  food_rescued_kg REAL DEFAULT 0,
  population_reached INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id SERIAL PRIMARY KEY,
  store_id TEXT REFERENCES stores(id),
  type TEXT NOT NULL CHECK (type IN ('pricing', 'inventory', 'marketing', 'operations')),
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed')),
  created_at TEXT NOT NULL,
  implemented_at TEXT
);

-- System Health
CREATE TABLE IF NOT EXISTS system_health (
  id SERIAL PRIMARY KEY,
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'high_load', 'down')),
  metric_name TEXT,
  metric_value TEXT,
  ping_ms INTEGER,
  uptime_pct REAL,
  checked_at TEXT NOT NULL
);

-- Integrations (Partner)
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pos', 'inventory', 'delivery', 'payment', 'analytics')),
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  api_key TEXT,
  webhook_url TEXT,
  config JSONB DEFAULT '{}',
  connected_at TEXT NOT NULL,
  last_sync_at TEXT
);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  integration_id TEXT REFERENCES integrations(id),
  event TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  request_body TEXT,
  response_body TEXT,
  created_at TEXT NOT NULL
);

-- API Usage Logs
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id SERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TEXT NOT NULL
);
