import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = getServerClient();
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data || data.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { password: _, ...user } = toCamelCase(data);
  const session = { user, token: `token_${data.id}_${Date.now()}` };
  return NextResponse.json(session);
}
