import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json(null);
  const supabase = getServerClient();
  if (!supabase) return NextResponse.json(null);

  const { data } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!data) return NextResponse.json(null);

  const { password: _, ...user } = toCamelCase(data);
  return NextResponse.json({ user, token: `token_${user.id}` });
}
