const postgres = require('postgres');

async function query() {
  const projectRef = 'ktnhoiqqecygxztsugkx';
  const password = encodeURIComponent('motminhcungonma');
  const connStr = `postgresql://postgres.${projectRef}:${password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`;
  const sql = postgres(connStr);
  try {
    const products = await sql`SELECT id, name, original_price, ai_price, discount, image, store_name, status, stock FROM products WHERE id IN ('p22', 'rp01')`;
    console.log('SPINACH PRODUCTS DETAILS:');
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    await sql.end();
  }
}

query();
