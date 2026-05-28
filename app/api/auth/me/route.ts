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
      // Nếu DB không có user (chưa seed), dùng mock admin từ token để không block env admin path
      if (decoded.userId === 'u-admin-fresh4') {
        const user = {
          id: 'u-admin-fresh4',
          email: decoded.role === 'admin' ? process.env.ADMIN_LOGIN || 'admin@fresh.com' : '',
          name: 'Fresh Admin 4',
          role: 'admin' as const,
          avatar: 'FA',
          status: 'active' as const,
        };
        return NextResponse.json({ user, token });
      }
      return NextResponse.json({ user: null, token: null });
    }

    if (data.status === 'banned' || data.status === 'suspended') {
      return NextResponse.json({ error: 'Account is restricted' }, { status: 403 });
    }

    const { password: _, ...user } = toCamelCase(data);

    if (user.role === 'partner') {
      const { data: branch } = await supabase
        .from('organization_branches')
        .select('store_id')
        .eq('organization_id', user.organizationId)
        .maybeSingle();
      if (branch) user.storeId = branch.store_id;
    }

    return NextResponse.json({ user, token });
  } catch (err) {
    console.error('Auth me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

