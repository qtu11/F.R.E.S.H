const { createClient } = require('@supabase/supabase-js');
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

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log("--- Supabase Auth Users ---");
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Auth error:", authError);
  } else {
    authData.users.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Meta:`, u.user_metadata);
    });
  }

  console.log("\n--- Public Users Table ---");
  const { data: dbData, error: dbError } = await supabase.from('users').select('id, email, name, role, status');
  if (dbError) {
    console.error("DB error:", dbError);
  } else {
    dbData.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | Status: ${u.status}`);
    });
  }
}

check();
