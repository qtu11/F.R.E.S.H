-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_recommendations (
  id integer NOT NULL DEFAULT nextval('ai_recommendations_id_seq'::regclass),
  store_id text,
  type text NOT NULL CHECK (type = ANY (ARRAY['pricing'::text, 'inventory'::text, 'marketing'::text, 'operations'::text])),
  title text NOT NULL,
  description text,
  impact text CHECK (impact = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'implemented'::text, 'dismissed'::text])),
  created_at text NOT NULL,
  implemented_at text,
  CONSTRAINT ai_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_recommendations_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.api_usage_logs (
  id integer NOT NULL DEFAULT nextval('api_usage_logs_id_seq'::regclass),
  endpoint text NOT NULL,
  method text NOT NULL,
  user_id text,
  status_code integer,
  response_time_ms integer,
  created_at text NOT NULL,
  ip_address text,
  user_agent text,
  is_suspicious boolean DEFAULT false,
  proxy_chain text,
  CONSTRAINT api_usage_logs_pkey PRIMARY KEY (id),
  CONSTRAINT api_usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.bank_accounts (
  id text NOT NULL,
  user_id text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  branch text,
  is_default boolean NOT NULL DEFAULT false,
  added_at text NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.banners (
  id text NOT NULL,
  title text NOT NULL,
  subtitle text,
  image text NOT NULL,
  color text NOT NULL DEFAULT 'emerald'::text,
  action_url text,
  active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at text NOT NULL,
  store_id text,
  CONSTRAINT banners_pkey PRIMARY KEY (id),
  CONSTRAINT banners_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.campaigns (
  id text NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['flash_sale'::text, 'bundle'::text, 'seasonal'::text, 'referral'::text, 'esg'::text])),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'ended'::text, 'cancelled'::text])),
  discount_rate integer,
  budget integer DEFAULT 0,
  spent integer DEFAULT 0,
  start_date text NOT NULL,
  end_date text NOT NULL,
  created_at text NOT NULL,
  store_id text,
  image text,
  target_impressions integer DEFAULT 0,
  target_conversions integer DEFAULT 0,
  actual_impressions integer DEFAULT 0,
  actual_conversions integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT campaigns_pkey PRIMARY KEY (id),
  CONSTRAINT campaigns_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.commission_rates (
  id text NOT NULL,
  name text NOT NULL,
  rate real NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['percentage'::text, 'fixed'::text])),
  min_order integer DEFAULT 0,
  max_cap integer,
  active boolean DEFAULT true,
  created_at text NOT NULL,
  updated_at text,
  CONSTRAINT commission_rates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.district_coverage (
  id integer NOT NULL DEFAULT nextval('district_coverage_id_seq'::regclass),
  district text NOT NULL UNIQUE,
  coverage_pct real DEFAULT 0,
  total_stores integer DEFAULT 0,
  active_stores integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  food_rescued_kg real DEFAULT 0,
  population_reached integer DEFAULT 0,
  updated_at text NOT NULL,
  CONSTRAINT district_coverage_pkey PRIMARY KEY (id)
);
CREATE TABLE public.esg_metrics (
  id integer NOT NULL DEFAULT nextval('esg_metrics_id_seq'::regclass),
  date text NOT NULL UNIQUE,
  food_rescued_kg real DEFAULT 0,
  co2_reduced_kg real DEFAULT 0,
  meals_saved integer DEFAULT 0,
  water_saved_l real DEFAULT 0,
  trees_equivalent integer DEFAULT 0,
  active_partners integer DEFAULT 0,
  active_customers integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  CONSTRAINT esg_metrics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.favorites (
  id integer NOT NULL DEFAULT nextval('favorites_id_seq'::regclass),
  user_id text NOT NULL,
  product_id text NOT NULL,
  created_at text NOT NULL,
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.forecasting_data (
  id integer NOT NULL DEFAULT nextval('forecasting_data_id_seq'::regclass),
  date text NOT NULL,
  hour integer,
  predicted_demand integer,
  actual_demand integer,
  confidence real,
  model_version text,
  created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP,
  store_id text,
  CONSTRAINT forecasting_data_pkey PRIMARY KEY (id),
  CONSTRAINT forecasting_data_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.fraud_alerts (
  id text NOT NULL,
  type text NOT NULL,
  store text NOT NULL,
  risk text NOT NULL CHECK (risk = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text, 'Critical'::text])),
  score integer NOT NULL,
  time text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'investigating'::text, 'resolved'::text, 'false_positive'::text])),
  CONSTRAINT fraud_alerts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gamification_badges (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['rescue'::text, 'esg'::text, 'social'::text, 'milestone'::text, 'special'::text])),
  threshold integer NOT NULL,
  tier_id text,
  CONSTRAINT gamification_badges_pkey PRIMARY KEY (id),
  CONSTRAINT gamification_badges_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.gamification_tiers(id)
);
CREATE TABLE public.gamification_missions (
  id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'achievement'::text])),
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  points_reward integer NOT NULL,
  icon text NOT NULL,
  active boolean DEFAULT true,
  created_at text NOT NULL,
  CONSTRAINT gamification_missions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gamification_tiers (
  id text NOT NULL,
  name text NOT NULL,
  min_points integer NOT NULL,
  max_points integer NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  benefits text NOT NULL,
  multiplier real DEFAULT 1.0,
  CONSTRAINT gamification_tiers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.integrations (
  id text NOT NULL,
  store_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['pos'::text, 'inventory'::text, 'delivery'::text, 'payment'::text, 'analytics'::text])),
  status text NOT NULL DEFAULT 'connected'::text CHECK (status = ANY (ARRAY['connected'::text, 'disconnected'::text, 'error'::text])),
  api_key text,
  webhook_url text,
  config jsonb DEFAULT '{}'::jsonb,
  connected_at text NOT NULL,
  last_sync_at text,
  CONSTRAINT integrations_pkey PRIMARY KEY (id),
  CONSTRAINT integrations_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.invoices (
  id text NOT NULL,
  store_id text NOT NULL,
  period text NOT NULL,
  total_orders integer NOT NULL DEFAULT 0,
  total_revenue integer NOT NULL DEFAULT 0,
  commission_rate real NOT NULL,
  commission_amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])),
  issued_at text NOT NULL,
  paid_at text,
  notes text,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.notifications (
  id text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['deal'::text, 'order'::text, 'voucher'::text, 'system'::text, 'community'::text, 'ai'::text])),
  title text NOT NULL,
  message text NOT NULL,
  time text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  icon text NOT NULL,
  action_url text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  user_id text,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.order_items (
  id integer NOT NULL DEFAULT nextval('order_items_id_seq'::regclass),
  order_id text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_image text NOT NULL,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id text NOT NULL,
  user_id text NOT NULL,
  store_name text NOT NULL,
  store_id text NOT NULL,
  subtotal integer NOT NULL,
  delivery_fee integer DEFAULT 0,
  service_fee integer DEFAULT 0,
  discount integer DEFAULT 0,
  total integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'in_transit'::text, 'delivered'::text, 'cancelled'::text])),
  delivery_method text DEFAULT 'delivery'::text CHECK (delivery_method = ANY (ARRAY['pickup'::text, 'delivery'::text])),
  payment_method text DEFAULT 'wallet'::text CHECK (payment_method = ANY (ARRAY['momo'::text, 'zalopay'::text, 'vnpay'::text, 'applepay'::text, 'wallet'::text])),
  created_at text NOT NULL,
  estimated_delivery text,
  delivered_at text,
  qr_code text,
  notes text,
  address text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.organization_branches (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  organization_id text NOT NULL,
  store_id text,
  name text NOT NULL,
  address text,
  phone text,
  manager_id text,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT organization_branches_pkey PRIMARY KEY (id),
  CONSTRAINT organization_branches_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_branches_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT organization_branches_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id)
);
CREATE TABLE public.organization_members (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  organization_id text NOT NULL,
  user_id text NOT NULL,
  role text NOT NULL DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'accountant'::text, 'staff'::text])),
  invited_by text,
  invited_at timestamp with time zone,
  joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['invited'::text, 'active'::text, 'disabled'::text])),
  permissions jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT organization_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id)
);
CREATE TABLE public.organizations (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  name text NOT NULL,
  tax_code text UNIQUE,
  address text,
  phone text,
  email text,
  website text,
  logo text,
  description text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text])),
  rejection_reason text,
  owner_id text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  approved_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.partner_documents (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  organization_id text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['business_license'::text, 'tax_certificate'::text, 'authorization_letter'::text, 'contract'::text, 'other'::text])),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer DEFAULT 0,
  mime_type text,
  uploaded_by text,
  uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  verified_by text,
  verified_at timestamp with time zone,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])),
  rejection_reason text,
  CONSTRAINT partner_documents_pkey PRIMARY KEY (id),
  CONSTRAINT partner_documents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT partner_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id),
  CONSTRAINT partner_documents_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id)
);
CREATE TABLE public.partners (
  id text NOT NULL,
  name text NOT NULL,
  owner text NOT NULL,
  location text NOT NULL,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at text NOT NULL,
  approved_at text,
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.points_history (
  id integer NOT NULL DEFAULT nextval('points_history_id_seq'::regclass),
  user_id text NOT NULL,
  points integer NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['earned'::text, 'spent'::text, 'expired'::text])),
  source text NOT NULL,
  reference_id text,
  description text,
  created_at text NOT NULL,
  CONSTRAINT points_history_pkey PRIMARY KEY (id),
  CONSTRAINT points_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.products (
  id text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  original_price integer NOT NULL,
  ai_price integer NOT NULL,
  expiry text NOT NULL,
  status text NOT NULL DEFAULT 'live'::text CHECK (status = ANY (ARRAY['live'::text, 'out_of_stock'::text, 'archived'::text])),
  image text NOT NULL,
  store_id text NOT NULL,
  store_name text NOT NULL,
  discount integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  rating real DEFAULT 0,
  review_count integer DEFAULT 0,
  co2_saved real DEFAULT 0,
  rescued_score integer DEFAULT 0,
  ingredients jsonb DEFAULT '[]'::jsonb,
  allergens jsonb DEFAULT '[]'::jsonb,
  nutrition jsonb DEFAULT '{}'::jsonb,
  distance real DEFAULT 0,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  description text,
  details text,
  mfg_date text,
  expiry_date text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.role_permissions (
  id text NOT NULL,
  role_name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at text NOT NULL,
  updated_at text,
  deleted_at timestamp with time zone,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.staff_activity_log (
  id integer NOT NULL DEFAULT nextval('staff_activity_log_id_seq'::regclass),
  staff_id text NOT NULL,
  action text NOT NULL,
  details text,
  created_at text NOT NULL,
  CONSTRAINT staff_activity_log_pkey PRIMARY KEY (id),
  CONSTRAINT staff_activity_log_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_members(id)
);
CREATE TABLE public.staff_members (
  id text NOT NULL,
  store_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['manager'::text, 'staff'::text, 'cashier'::text])),
  permissions jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  created_at text NOT NULL,
  last_active text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT staff_members_pkey PRIMARY KEY (id),
  CONSTRAINT staff_members_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stores (
  id text NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  rating real DEFAULT 0,
  review_count integer DEFAULT 0,
  is_open boolean DEFAULT true,
  open_hours text,
  distance real DEFAULT 0,
  deals_count integer DEFAULT 0,
  image text,
  since text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.support_tickets (
  id text NOT NULL,
  customer text NOT NULL,
  issue text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium'::text CHECK (priority = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text, 'Urgent'::text])),
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'resolved'::text, 'escalated'::text])),
  created_at text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['delivery'::text, 'payment'::text, 'product'::text, 'account'::text, 'technical'::text])),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.system_health (
  id integer NOT NULL DEFAULT nextval('system_health_id_seq'::regclass),
  component text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['healthy'::text, 'warning'::text, 'high_load'::text, 'down'::text])),
  metric_name text,
  metric_value text,
  ping_ms integer,
  uptime_pct real,
  checked_at text NOT NULL,
  CONSTRAINT system_health_pkey PRIMARY KEY (id)
);
CREATE TABLE public.system_settings (
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT system_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.ticket_responses (
  id integer NOT NULL DEFAULT nextval('ticket_responses_id_seq'::regclass),
  ticket_id text NOT NULL,
  from_text text NOT NULL,
  message text NOT NULL,
  time text NOT NULL,
  CONSTRAINT ticket_responses_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_responses_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id)
);
CREATE TABLE public.tracking_steps (
  id integer NOT NULL DEFAULT nextval('tracking_steps_id_seq'::regclass),
  order_id text NOT NULL,
  status text NOT NULL,
  time text NOT NULL DEFAULT ''::text,
  completed boolean NOT NULL DEFAULT false,
  CONSTRAINT tracking_steps_pkey PRIMARY KEY (id),
  CONSTRAINT tracking_steps_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.transactions (
  id text NOT NULL,
  user_id text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['revenue'::text, 'withdrawal'::text, 'topup'::text, 'payment'::text, 'refund'::text, 'commission'::text])),
  amount integer NOT NULL,
  date text NOT NULL,
  status text NOT NULL DEFAULT 'completed'::text CHECK (status = ANY (ARRAY['completed'::text, 'pending'::text, 'failed'::text])),
  description text NOT NULL,
  payment_method text,
  reference text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_badges (
  id integer NOT NULL DEFAULT nextval('user_badges_id_seq'::regclass),
  user_id text NOT NULL,
  badge_id text NOT NULL,
  earned_at text NOT NULL,
  CONSTRAINT user_badges_pkey PRIMARY KEY (id),
  CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.gamification_badges(id)
);
CREATE TABLE public.user_missions (
  id integer NOT NULL DEFAULT nextval('user_missions_id_seq'::regclass),
  user_id text NOT NULL,
  mission_id text NOT NULL,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at text,
  claimed boolean DEFAULT false,
  CONSTRAINT user_missions_pkey PRIMARY KEY (id),
  CONSTRAINT user_missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_missions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.gamification_missions(id)
);
CREATE TABLE public.user_role_assignments (
  id integer NOT NULL DEFAULT nextval('user_role_assignments_id_seq'::regclass),
  user_id text NOT NULL,
  role_id text NOT NULL,
  CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_role_assignments_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role_permissions(id)
);
CREATE TABLE public.user_vouchers (
  id integer NOT NULL DEFAULT nextval('user_vouchers_id_seq'::regclass),
  user_id text NOT NULL,
  voucher_id text NOT NULL,
  claimed_at text NOT NULL,
  used_at text,
  order_id text,
  CONSTRAINT user_vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT user_vouchers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_vouchers_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'customer'::text CHECK (role = ANY (ARRAY['customer'::text, 'partner'::text, 'admin'::text])),
  avatar text NOT NULL,
  phone text,
  address text,
  join_date text,
  last_active text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text, 'banned'::text])),
  green_points integer DEFAULT 0,
  food_rescued real DEFAULT 0,
  co2_reduced real DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  wallet_balance integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  organization_id text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.vouchers (
  id text NOT NULL,
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage'::text CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text])),
  discount_value integer NOT NULL,
  min_order integer DEFAULT 0,
  max_discount integer,
  usage_limit integer DEFAULT 1,
  used_count integer DEFAULT 0,
  valid_from text NOT NULL,
  valid_until text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'expired'::text, 'disabled'::text])),
  created_at text NOT NULL,
  store_id text,
  image text,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp with time zone,
  CONSTRAINT vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT vouchers_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.waste_hotspots (
  id text NOT NULL,
  district text NOT NULL,
  ward text,
  latitude real NOT NULL,
  longitude real NOT NULL,
  waste_amount real NOT NULL,
  food_type text,
  frequency text CHECK (frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'rare'::text])),
  severity text CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])),
  notes text,
  last_reported text,
  created_at text NOT NULL,
  CONSTRAINT waste_hotspots_pkey PRIMARY KEY (id)
);
CREATE TABLE public.webhook_logs (
  id integer NOT NULL DEFAULT nextval('webhook_logs_id_seq'::regclass),
  integration_id text,
  event text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'pending'::text])),
  request_body text,
  response_body text,
  created_at text NOT NULL,
  CONSTRAINT webhook_logs_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_logs_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.integrations(id)
);