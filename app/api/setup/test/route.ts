import { NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) throw { status: 401, message: 'Unauthorized' };
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') throw { status: 403, message: 'Admin required' };
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { supabaseUrl, supabaseAnonKey, serviceRoleKey } = await req.json();
    const client = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.from('users').select('count(*)', { count: 'exact', head: true });
    return NextResponse.json({ success: !error, error: error?.message || null });
  } catch (err: any) {
    if (err.status) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
