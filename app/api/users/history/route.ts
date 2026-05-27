import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireRole } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Lấy lịch sử đơn hàng
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) return handleError(ordersError);

    // 2. Lấy lịch sử giao dịch ví
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (txError) return handleError(txError);

    // 3. Lấy lịch sử điểm thưởng
    const { data: points, error: pointsError } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (pointsError) return handleError(pointsError);

    return NextResponse.json({
      orders: toCamelCase(orders || []),
      transactions: toCamelCase(transactions || []),
      pointsHistory: toCamelCase(points || [])
    });
  } catch (err) {
    return handleError(err);
  }
}
