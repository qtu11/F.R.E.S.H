import { createClient } from '@supabase/supabase-js';
import { loadConfig } from './config';

export function getServerClient() {
  const config = loadConfig();
  if (!config.supabaseUrl || !config.serviceRoleKey) return null;
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAdminClient() {
  return getServerClient();
}
