import postgres from 'postgres';

const poolers = [
  { name: 'Singapore (ap-southeast-1)', ip: '54.255.219.82' },
  { name: 'Tokyo (ap-northeast-1)', ip: '52.68.3.1' },
  { name: 'US-East (us-east-1)', ip: '44.208.221.186' }
];

async function testAll() {
  for (const pooler of poolers) {
    console.log(`Testing connection to ${pooler.name} at IP ${pooler.ip}...`);
    const connStr = `postgresql://postgres.ktnhoiqqecygxztsugkx:motminhcungonma@${pooler.ip}:6543/postgres?sslmode=require`;
    const sql = postgres(connStr, { max: 1, timeout: 5, ssl: 'require' });
    try {
      // Run a simple query
      const result = await sql`SELECT 1 as connected`;
      console.log(`SUCCESS: Connected to ${pooler.name}! Result:`, result);
      await sql.end();
      return pooler.ip; // Found it!
    } catch (err: any) {
      console.log(`FAILED: ${pooler.name}. Error: ${err.message || err}`);
    } finally {
      await sql.end().catch(() => {});
    }
  }
  console.log('All connection tests failed.');
  return null;
}

testAll();
