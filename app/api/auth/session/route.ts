import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      const body = await req.json().catch(() => ({}));
      if (!body.userId) return NextResponse.json(null);

      const supabase = getServerClient();
      if (!supabase) return NextResponse.json(null);

      const { data } = await supabase.from('users').select('*').eq('id', body.userId).single();
      if (!data) return NextResponse.json(null);

      const { password: _, ...user } = toCamelCase(data);
      if (user.role === 'partner') {
        const { data: partner } = await supabase.from('partners').select('store_id').eq('user_id', user.id).maybeSingle();
        if (partner) user.storeId = partner.store_id;
      }
      return NextResponse.json({ user, token: `legacy_${user.id}` });
    }

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json(null);

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json(null);

    const { data } = await supabase.from('users').select('*').eq('id', decoded.userId).single();
    if (!data) return NextResponse.json(null);

    const { password: _, ...user } = toCamelCase(data);
    if (user.role === 'partner') {
      const { data: partner } = await supabase.from('partners').select('store_id').eq('user_id', user.id).maybeSingle();
      if (partner) user.storeId = partner.store_id;
    }
    return NextResponse.json({ user, token });
  } catch {
    return NextResponse.json(null);
  }
}
