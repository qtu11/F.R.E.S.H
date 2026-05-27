const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Đọc và parse file .env bằng tay
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing env keys. Url:", supabaseUrl, "Key length:", serviceRoleKey ? serviceRoleKey.length : 0);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testPatch() {
  // Lấy 1 user đầu tiên
  const { data: users, error: selectError } = await supabase.from('users').select('id, email, status').limit(1);
  if (selectError) {
    console.error("Select error:", selectError);
    return;
  }
  if (!users || users.length === 0) {
    console.log("No users in public.users");
    return;
  }

  const targetUser = users[0];
  console.log("Target user:", targetUser);

  // Thử cập nhật status của chính user đó thành 'active'
  console.log("Updating status to 'active'...");
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq('id', targetUser.id)
    .select()
    .single();

  if (updateError) {
    console.error("Update error detail:", updateError);
  } else {
    console.log("Update SUCCESS:", updated);
  }
}

testPatch();
