import { readFileSync } from 'fs';
import path from 'path';
import postgres from 'postgres';

async function run() {
  console.log('Connecting directly to Supabase Pooler IP...');
  
  // Connect using direct IP and transaction pooler port 6543 with SSL
  const connStr = 'postgresql://postgres.ktnhoiqqecygxztsugkx:motminhcungonma@54.255.219.82:6543/postgres?sslmode=require';

  const sql = postgres(connStr, { max: 1, ssl: 'require' });
  try {
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '005_add_product_details.sql');
    console.log(`Reading migration from: ${migrationPath}`);
    const query = readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying migration...');
    await sql.unsafe(query);
    console.log('Migration Applied Successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
