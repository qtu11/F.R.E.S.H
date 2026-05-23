import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      // Trả về 200 kèm user null thay vì 401 để Next.js console luôn sạch log
      return NextResponse.json({ user: null, token: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ user: null, token: null });
    }

    const supabase = getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ user: null, token: null });
    }

    if (data.status === 'banned' || data.status === 'suspended') {
      return NextResponse.json({ error: 'Account is restricted' }, { status: 403 });
    }

    const { password: _, ...user } = toCamelCase(data);

    if (user.role === 'partner') {
      const { data: partner } = await supabase
        .from('partners')
        .select('store_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (partner) user.storeId = partner.store_id;
    }

    return NextResponse.json({ user, token });
  } catch (err) {
    console.error('Auth me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

