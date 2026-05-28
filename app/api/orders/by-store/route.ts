import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAnyRole, checkStoreAccess } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    if (!storeId) return NextResponse.json([]);

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, storeId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    const { data: orders, error } = await supabase
      .from('orders').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
    if (error) return handleError(error);

    const enriched = await Promise.all((orders || []).map(async (o: any) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
      const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', o.id);
      return { ...o, items: items || [], trackingSteps: steps || [] };
    }));
    return NextResponse.json(toCamelCase(enriched));
  } catch (err) { return handleError(err); }
}
