import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { logSecurityEvent } from '@/lib/auth/security';
import { sendOrderConfirmationEmail } from '@/utils/email/mailer';

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
    const paymentMethod = orderData.payment_method;

    // 1. Tính toán lại subtotal từ database và kiểm tra tồn kho sản phẩm
    let computedSubtotal = 0;
    if (orderItemData && orderItemData.length > 0) {
      for (const item of orderItemData) {
        const { data: product, error: prodErr } = await supabase
          .from('products')
          .select('name, stock, status, ai_price')
          .eq('id', item.product_id)
          .single();

        if (prodErr || !product) {
          return NextResponse.json({ error: `Sản phẩm không tồn tại trong hệ thống` }, { status: 400 });
        }

        if (product.stock < item.quantity || product.status === 'out_of_stock') {
          return NextResponse.json({ error: `Sản phẩm "${product.name}" đã hết hàng hoặc không đủ tồn kho` }, { status: 400 });
        }

        // Ghi đè đơn giá từ database để chống Client tự thay đổi giá sản phẩm
        item.unit_price = product.ai_price;
        computedSubtotal += product.ai_price * item.quantity;
      }
    } else {
      return NextResponse.json({ error: 'Đơn hàng phải chứa ít nhất 1 sản phẩm' }, { status: 400 });
    }

    // 2. Xác thực Voucher (nếu có voucher_id) và tính toán discount
    let discount = 0;
    const voucherId = orderData.voucher_id || data.voucher_id;

    if (voucherId) {
      // Kiểm tra xem khách hàng có sở hữu voucher này và chưa sử dụng không
      const { data: userVoucher, error: uvErr } = await supabase
        .from('user_vouchers')
        .select('*, voucher:vouchers(*)')
        .eq('user_id', userId)
        .eq('voucher_id', voucherId)
        .maybeSingle();

      if (uvErr || !userVoucher) {
        return NextResponse.json({ error: 'Bạn không sở hữu voucher này hoặc voucher không hợp lệ' }, { status: 400 });
      }

      if (userVoucher.used_at) {
        return NextResponse.json({ error: 'Voucher này đã được sử dụng trước đó' }, { status: 400 });
      }

      const voucher = userVoucher.voucher;
      if (!voucher) {
        return NextResponse.json({ error: 'Thông tin voucher không tồn tại trên hệ thống' }, { status: 400 });
      }

      // Kiểm tra hạn sử dụng của voucher
      if (voucher.valid_until && new Date(voucher.valid_until).getTime() < Date.now()) {
        return NextResponse.json({ error: 'Voucher này đã hết hạn sử dụng' }, { status: 400 });
      }
      if (voucher.valid_from && new Date(voucher.valid_from).getTime() > Date.now()) {
        return NextResponse.json({ error: 'Voucher chưa đến thời gian áp dụng' }, { status: 400 });
      }

      // Kiểm tra điều kiện đơn hàng tối thiểu
      const minOrder = voucher.min_order || 0;
      if (computedSubtotal < minOrder) {
        return NextResponse.json({ error: `Đơn hàng tối thiểu để dùng voucher này là ${minOrder.toLocaleString('vi-VN')}đ` }, { status: 400 });
      }

      // Kiểm tra xem voucher có áp dụng cho đúng store của đơn hàng không
      if (voucher.store_id && voucher.store_id !== orderData.store_id) {
        return NextResponse.json({ error: 'Voucher không áp dụng cho cửa hàng này' }, { status: 400 });
      }

      // Tính toán giá trị giảm giá thực tế
      if (voucher.discount_type === 'percentage') {
        const pctDiscount = Math.round((computedSubtotal * voucher.discount_value) / 100);
        discount = voucher.max_discount ? Math.min(pctDiscount, voucher.max_discount) : pctDiscount;
      } else if (voucher.discount_type === 'fixed') {
        discount = voucher.discount_value;
      }

      discount = Math.min(discount, computedSubtotal); // Giới hạn discount không vượt quá subtotal
    }

    // Thiết lập các chi phí cố định và tổng tiền thanh toán an toàn
    const deliveryFee = orderData.delivery_method === 'pickup' ? 0 : 5000;
    const serviceFee = 2000;
    const total = Math.max(0, computedSubtotal + deliveryFee + serviceFee - discount);

    // Ghi đè dữ liệu tính toán từ Backend để lưu vào database
    orderData.subtotal = computedSubtotal;
    orderData.delivery_fee = deliveryFee;
    orderData.service_fee = serviceFee;
    orderData.discount = discount;
    orderData.total = total;

    // 3. Nếu thanh toán qua ví, kiểm tra số dư ví khách hàng
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

    // 4. Cập nhật số lượng sản phẩm (stock) trong kho
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

    // 5. Tạo đơn hàng (Order)
    const { error: orderErr } = await supabase.from('orders').insert({
      ...orderData,
      id,
      user_id: userId,
      status: 'pending',
      created_at: now,
      estimated_delivery: new Date(Date.now() + 20 * 60000).toISOString(),
    });
    if (orderErr) return handleError(orderErr);

    // 6. Tạo các sản phẩm trong đơn hàng (Order Items)
    if (orderItemData?.length) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        orderItemData.map((item: any) => ({ ...item, order_id: id }))
      );
      if (itemsErr) return handleError(itemsErr);
    }

    // 7. Cập nhật trạng thái voucher đã sử dụng trong user_vouchers (Đề phòng Double Spending)
    if (voucherId) {
      const { error: uvUpdErr } = await supabase
        .from('user_vouchers')
        .update({ used_at: now, order_id: id })
        .eq('user_id', userId)
        .eq('voucher_id', voucherId);

      if (uvUpdErr) return handleError(uvUpdErr);
    }

    // 8. Tạo tracking steps
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const { error: stepsErr } = await supabase.from('tracking_steps').insert([
      { order_id: id, status: 'pending', time, completed: true },
      ...statusFlow.slice(1).map(s => ({ order_id: id, status: s, time: '', completed: false })),
    ]);
    if (stepsErr) return handleError(stepsErr);

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    
    // Truy xuất thông tin email/name của user và gửi email hóa đơn điện tử
    const { data: user } = await supabase.from('users').select('email, name').eq('id', userId).single();
    if (user && user.email) {
      const emailItems = (items || []).map((it: any) => ({
        name: it.product_name || 'Sản phẩm giải cứu',
        quantity: it.quantity,
        price: it.unit_price || it.price
      }));
      
      const co2Saved = orderData.co2_saved || (3.6 * (items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 1));
      const pointsEarned = orderData.points_earned || Math.floor(total / 1000);

      sendOrderConfirmationEmail(
        user.email,
        user.name || 'Thành viên',
        id.substring(0, 8).toUpperCase(),
        emailItems,
        total,
        co2Saved,
        pointsEarned
      ).catch(err => {
        console.error('Failed to send order email:', err);
      });
    }

    await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 201, Date.now() - startTime);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }), { status: 201 });
  } catch (err) {
    await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 500, Date.now() - startTime);
    return handleError(err);
  }
}
