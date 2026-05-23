const postgres = require('postgres');

const regions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1'
];

async function testRegions() {
  const password = encodeURIComponent('motminhcungonma');
  const projectRef = 'ktnhoiqqecygxztsugkx';
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connStr = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres?sslmode=require`;
    console.log(`Testing region: ${region} (${host})...`);
    
    // Connect with a short timeout
    const sql = postgres(connStr, { connect_timeout: 3 });
    try {
      const result = await sql`SELECT 1 as connected`;
      console.log(`SUCCESS: Connected to ${region}!`, result);
      await sql.end();
      process.exit(0);
    } catch (err) {
      console.log(`FAILED for ${region}:`, err.message);
    } finally {
      await sql.end();
    }
  }
  console.log('All regions failed.');
}

testRegions();
