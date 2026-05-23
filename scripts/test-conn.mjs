import { createClient } from '@supabase/supabase-js';

const url = 'https://ktnhoiqqecygxztsugkx.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bmhvaXFxZWN5Z3h6dHN1Z2t4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA3MzEyMywiZXhwIjoyMDk0NjQ5MTIzfQ.gfeY57zD2DqZw857wMTF8H0rgcexw6dElvAA-fVfhhk';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
  if (error) {
    console.log('ERROR:', error.message);
    return;
  }
  console.log('Connected! Count:', data);
}
run();
