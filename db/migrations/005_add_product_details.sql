-- Add description, details, mfg_date, and expiry_date to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mfg_date TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date TEXT;
