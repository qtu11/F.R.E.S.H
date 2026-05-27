const fs = require('fs');
const path = require('path');

// Đọc và parse file .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').replace(/"/g, '').trim();
  }
});

const adminEmail = env['ADMIN_LOGIN'] || 'freshadmin4@gmail.com';
const adminPassword = env['ADMIN_PASSWORD'] || 'freshadminuef';

async function run() {
  console.log("Logging in as admin:", adminEmail);
  
  // 1. Đăng nhập để lấy token và cookie
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });

  if (!loginRes.ok) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  const cookie = loginRes.headers.get('set-cookie');
  console.log("Login success! Token length:", token ? token.length : 0);

  // 2. Thử PATCH cập nhật status của user 'u1' (Minh Trần) thành 'active'
  console.log("Sending PATCH request to update status of user 'u1' to 'active'...");
  const patchRes = await fetch('http://localhost:3001/api/users', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie || `fresh_session=${token}`
    },
    body: JSON.stringify({ id: 'u1', status: 'active' })
  });

  console.log("PATCH response status:", patchRes.status);
  const patchText = await patchRes.text();
  console.log("PATCH response body:", patchText);
}

run();
