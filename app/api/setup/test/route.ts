import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { supabaseUrl, supabaseAnonKey, serviceRoleKey } = await req.json();
    const client = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.from('users').select('count(*)', { count: 'exact', head: true });
    return NextResponse.json({ success: !error, error: error?.message || null });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
