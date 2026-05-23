import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'https://ktnhoiqqecygxztsugkx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bmhvaXFxZWN5Z3h6dHN1Z2t4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA3MzEyMywiZXhwIjoyMDk0NjQ5MTIzfQ.gfeY57zD2DqZw857wMTF8H0rgcexw6dElvAA-fVfhhk';

const supabase = createClient(url, key);

const TABLES_SQL = readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf-8');

async function checkTable(name) {
  const { error } = await supabase.from(name).select('count', { count: 'exact', head: true });
  return !error || !error.message?.includes('does not exist');
}

async function createTables() {
  // Supabase REST API supports INSERT - we can use it to create the migration tracker
  // For DDL, we need to use the SQL endpoint
  
  // Try executing via direct fetch to Supabase SQL endpoint
  const statements = TABLES_SQL.split(';').map(s => s.trim()).filter(Boolean);
  
  // Try the /sql endpoint
  for (const stmt of statements.slice(0, 3)) {
    try {
      const res = await fetch(`${url}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({}), // dummy
      });
      if (res.ok) console.log('REST endpoint works');
    } catch {}
  }

  // Check which tables already exist
  const tables = ['users', 'stores', 'products', 'orders', 'order_items', 'transactions', 'partners'];
  for (const t of tables) {
    const exists = await checkTable(t);
    console.log(`Table ${t}: ${exists ? 'EXISTS' : 'MISSING'}`);
  }
}

createTables().catch(console.error);
