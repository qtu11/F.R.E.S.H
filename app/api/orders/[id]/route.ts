import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAuth, checkStoreAccess } from '@/lib/auth/middleware';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const { id } = await params;
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error || !order) return NextResponse.json(null, { status: 404 });

    // IDOR check:
    // 1. Admin được xem hết
    // 2. Customer chỉ xem được đơn hàng của chính mình
    // 3. Partner chỉ xem được đơn hàng của cửa hàng mình quản lý
    if (auth.user.role === 'customer' && order.user_id !== auth.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }
    if (auth.user.role === 'partner') {
      const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, order.store_id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }
    }
    if (auth.user.role !== 'admin' && auth.user.role !== 'customer' && auth.user.role !== 'partner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const { id } = await params;
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', id).single();
    if (orderErr || !order) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });

    // Phân quyền cập nhật đơn hàng:
    // 1. Admin được cập nhật
    // 2. Partner được cập nhật nếu đơn hàng thuộc cửa hàng của họ quản lý
    // 3. Khách hàng không có quyền cập nhật tự do qua PATCH này
    if (auth.user.role === 'partner') {
      const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, order.store_id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }
    } else if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = toSnakeCase(await req.json());
    await supabase.from('orders').update(data).eq('id', id);

    const { data: updatedOrder } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...updatedOrder, items: items || [], trackingSteps: steps || [] }));
  } catch (err) { return handleError(err); }
}
