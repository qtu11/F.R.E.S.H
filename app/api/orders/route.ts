import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { logSecurityEvent } from '@/lib/auth/security';

export async function GET(req: Request) {
  const startTime = Date.now();
  try {
    const auth = await requireAuth();
    if ('status' in auth) {
      await logSecurityEvent(req, null, '/api/orders', 'GET', 401, Date.now() - startTime);
      return auth;
    }

    const supabase = getServerClient();
    if (!supabase) {
      await logSecurityEvent(req, auth.user.userId, '/api/orders', 'GET', 503, Date.now() - startTime);
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    let query = supabase.from('orders').select('*');

    if (auth.user.role === 'customer') {
      query = query.eq('user_id', auth.user.userId);
    } else if (auth.user.role === 'partner') {
      const { data: stores } = await supabase.from('stores').select('id').eq('partner_id', auth.user.userId);
      const storeIds = (stores || []).map(s => s.id);
      query = query.in('store_id', storeIds);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });
    if (error) {
      await logSecurityEvent(req, auth.user.userId, '/api/orders', 'GET', 500, Date.now() - startTime);
      return handleError(error);
    }

    const enriched = await Promise.all((orders || []).map(async (o: any) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
      const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', o.id);
      return { ...o, items: items || [], trackingSteps: steps || [] };
    }));
    
    await logSecurityEvent(req, auth.user.userId, '/api/orders', 'GET', 200, Date.now() - startTime);
    return NextResponse.json(toCamelCase(enriched));
  } catch (err) {
    await logSecurityEvent(req, null, '/api/orders', 'GET', 500, Date.now() - startTime);
    return handleError(err);
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let currentUserId: string | null = null;
  try {
    const auth = await requireRole('customer');
    if ('status' in auth) {
      await logSecurityEvent(req, null, '/api/orders', 'POST', 403, Date.now() - startTime);
      return auth;
    }
    
    currentUserId = auth.user.userId;

    const supabase = getServerClient();
    if (!supabase) {
      await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 503, Date.now() - startTime);
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    const data = toSnakeCase(await req.json());
    const { items: orderItemData, ...orderData } = data;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered'];

    const userId = auth.user.userId;
    const total = orderData.total;
    const paymentMethod = orderData.payment_method;

    // 1. Kiểm tra tồn kho sản phẩm
    if (orderItemData && orderItemData.length > 0) {
      for (const item of orderItemData) {
        const { data: product, error: prodErr } = await supabase
          .from('products')
          .select('name, stock, status')
          .eq('id', item.product_id)
          .single();

        if (prodErr || !product) {
          return NextResponse.json({ error: `Sản phẩm không tồn tại trong hệ thống` }, { status: 400 });
        }

        if (product.stock < item.quantity || product.status === 'out_of_stock') {
          return NextResponse.json({ error: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ tồn kho` }, { status: 400 });
        }
      }
    }

    // 2. Nếu thanh toán qua ví, kiểm tra số dư ví khách hàng
    if (paymentMethod === 'wallet') {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (userErr || !user) {
        return NextResponse.json({ error: 'Không thể xác thực thông tin tài khoản người dùng' }, { status: 400 });
      }

      if ((user.wallet_balance || 0) < total) {
        return NextResponse.json({ error: 'Số dư ví FRESH không đủ để thực hiện thanh toán đơn hàng này' }, { status: 400 });
      }

      // Trừ tiền ví của khách hàng
      const newBalance = user.wallet_balance - total;
      const { error: balanceErr } = await supabase
        .from('users')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

      if (balanceErr) return handleError(balanceErr);

      // Tạo bản ghi giao dịch (transaction) ví cho khách hàng
      const { error: txErr } = await supabase.from('transactions').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        type: 'payment',
        amount: -total,
        date: now,
        status: 'completed',
        description: `Thanh toán đơn hàng #${id.substring(0, 8)}`,
        payment_method: 'wallet'
      });

      if (txErr) return handleError(txErr);
    }

    // 3. Cập nhật số lượng sản phẩm (stock) trong kho
    if (orderItemData && orderItemData.length > 0) {
      for (const item of orderItemData) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        const currentStock = product?.stock || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        await supabase
          .from('products')
          .update({ 
            stock: newStock,
            status: newStock === 0 ? 'out_of_stock' : 'live'
          })
          .eq('id', item.product_id);
      }
    }

    // 4. Tạo đơn hàng (Order)
    const { error: orderErr } = await supabase.from('orders').insert({
      ...orderData,
      id,
      user_id: userId,
      status: 'pending',
      created_at: now,
      estimated_delivery: new Date(Date.now() + 20 * 60000).toISOString(),
    });
    if (orderErr) return handleError(orderErr);

    // 5. Tạo các sản phẩm trong đơn hàng (Order Items)
    if (orderItemData?.length) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        orderItemData.map((item: any) => ({ ...item, order_id: id }))
      );
      if (itemsErr) return handleError(itemsErr);
    }

    // 6. Tạo tracking steps
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const { error: stepsErr } = await supabase.from('tracking_steps').insert([
      { order_id: id, status: 'pending', time, completed: true },
      ...statusFlow.slice(1).map(s => ({ order_id: id, status: s, time: '', completed: false })),
    ]);
    if (stepsErr) return handleError(stepsErr);

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    
    await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 201, Date.now() - startTime);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }), { status: 201 });
  } catch (err) {
    await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 500, Date.now() - startTime);
    return handleError(err);
  }
}
