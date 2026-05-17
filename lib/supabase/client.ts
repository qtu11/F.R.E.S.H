import { createClient } from '@supabase/supabase-js';
import { loadConfig } from './config';

const config = loadConfig();

export const supabase = config.supabaseUrl && config.supabaseAnonKey
  ? createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

export const isSupabaseReady = () => supabase !== null;
