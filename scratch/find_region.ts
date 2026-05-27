import postgres from 'postgres';
import http from 'https';

const regions = [
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-central-1',   // Frankfurt
  'ca-central-1',   // Canada Central
  'sa-east-1'       // Sao Paulo
];

function resolveDNS(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    const url = `https://dns.google/resolve?name=${hostname}&type=A`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.Answer) {
            const ips = parsed.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data);
            resolve(ips);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => {
      resolve([]);
    });
  });
}

async function scan() {
  console.log('Starting global Supabase region scan for tenant ktnhoiqqecygxztsugkx...');
  for (const region of regions) {
    const hostname = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Resolving DNS for ${region}...`);
    const ips = await resolveDNS(hostname);
    if (ips.length === 0) {
      console.log(`Could not resolve IP for region ${region}`);
      continue;
    }
    
    const targetIp = ips[0];
    console.log(`Resolved ${region} to IP ${targetIp}. Testing connection...`);
    
    const connStr = `postgresql://postgres.ktnhoiqqecygxztsugkx:motminhcungonma@${targetIp}:6543/postgres?sslmode=require`;
    const sql = postgres(connStr, { max: 1, timeout: 5, ssl: 'require' });
    try {
      const result = await sql`SELECT 1 as connected`;
      console.log(`\n🎉 SUCCESS!!! Database is in region: ${region} (IP: ${targetIp})`);
      await sql.end();
      process.exit(0);
    } catch (err: any) {
      console.log(`FAILED ${region}: ${err.message || err}`);
    } finally {
      await sql.end().catch(() => {});
    }
  }
  console.log('\n❌ Scan finished. No region succeeded.');
}

scan();
