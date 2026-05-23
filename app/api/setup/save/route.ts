import { NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { saveConfig } from '@/lib/supabase/config';

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
    const body = await req.json();
    const config = saveConfig(body);
    return NextResponse.json({ success: true, configured: config.configured });
  } catch (err: any) {
    if (err.status) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
