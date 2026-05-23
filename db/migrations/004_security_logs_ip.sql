-- Migration 004: Add ip_address and user_agent columns to api_usage_logs for cybersecurity tracking
ALTER TABLE api_usage_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE api_usage_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE api_usage_logs ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE;
ALTER TABLE api_usage_logs ADD COLUMN IF NOT EXISTS proxy_chain TEXT;
