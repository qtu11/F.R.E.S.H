import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json(0);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    // Nếu có userId trong query, kiểm tra xem có khớp với token hoặc là admin
    const targetUserId = userId || auth.user.userId;
    if (auth.user.role !== 'admin' && auth.user.userId !== targetUserId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    const { data, error } = await supabase.from('users').select('wallet_balance').eq('id', targetUserId).single();
    if (error) return handleError(error);
    return NextResponse.json(data?.wallet_balance || 0);
  } catch (err) { return handleError(err); }
}

