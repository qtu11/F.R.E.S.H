import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const env: Record<string, string> = {};
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        env[key] = val;
      }
    });
  } catch (err) {
    console.error('Failed to load .env file:', err);
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Querying one product from products table...');
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error querying products:', error);
  } else if (data && data.length > 0) {
    console.log('Successfully fetched product. Row keys:');
    console.log(Object.keys(data[0]));
    console.log('Full product object preview:', data[0]);
  } else {
    console.log('No products found in the database table.');
  }
}

check();
