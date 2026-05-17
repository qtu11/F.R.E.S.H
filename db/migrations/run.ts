import { readFileSync } from 'fs';
import path from 'path';
import { loadConfig, getConnectionString } from '../../lib/supabase/config';
import postgres from 'postgres';

async function run() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) { console.error('Database not configured'); process.exit(1); }

  const sql = postgres(connStr, { max: 1 });
  try {
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '001_init.sql');
    await sql.unsafe(readFileSync(migrationPath, 'utf-8'));
    console.log('Migration applied');
  } catch (err) { console.error('Migration failed:', err); process.exit(1); }
  finally { await sql.end(); }
}

run();
