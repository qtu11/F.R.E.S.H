import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktnhoiqqecygxztsugkx.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) { console.error('SUPABASE_SERVICE_ROLE_KEY required'); process.exit(1); }

const supabase = createClient(url, key);

async function run() {
  const sqlPath = path.join(__dirname, '..', 'db', 'migrations', '001_init.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  // Split by semicolons, run each statement via raw SQL REST API
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      // Use Supabase REST API to run raw SQL (via management API)
      const res = await fetch(`${url}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'params=single-object',
        },
        body: JSON.stringify({ query: stmt + ';' }),
      });
      if (res.ok) { success++; }
      else {
        const text = await res.text();
        if (!text.includes('already exists')) { failed++; console.error('Error:', text?.slice(0, 200)); }
        else { success++; }
      }
    } catch (e) {
      if (!e.message?.includes('already exists')) { failed++; console.error('Exception:', e.message); }
      else { success++; }
    }
  }

  console.log(`Migration: ${success} OK, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

run().catch(console.error);
