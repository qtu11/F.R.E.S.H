import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { logSecurityEvent } from '@/lib/auth/security';
import { sendOrderConfirmationEmail } from '@/utils/email/mailer';
import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import postgres from 'postgres';

async function getDbClient() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) return null;
  return postgres(connStr, { max: 1 });
}

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
  let sql: postgres.Sql | null = null;
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

    sql = await getDbClient();
    if (!sql) {
      await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 500, Date.now() - startTime);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    let discount = 0;
    const voucherId = orderData.voucher_id || data.voucher_id;
    let computedSubtotal = 0;
    const productsToUpdate: { id: string; quantity: number }[] = [];

    // Bắt đầu database transaction
    try {
      await sql.begin(async sql => {
        // 1. Tính toán lại subtotal từ database và kiểm tra tồn kho sản phẩm
        if (orderItemData && orderItemData.length > 0) {
          for (const item of orderItemData) {
            const products = await sql`
              SELECT id, name, stock, status, ai_price::numeric as ai_price 
              FROM products WHERE id = ${item.product_id}
            `;

            if (products.length === 0) {
              throw new Error(`Sản phẩm với ID ${item.product_id} không tồn tại trong hệ thống`);
            }
            const product = products[0];

            if (product.stock < item.quantity || product.status === 'out_of_stock') {
              throw new Error(`Sản phẩm "${product.name}" đã hết hàng hoặc không đủ tồn kho`);
            }

            // Ghi đè đơn giá từ database để chống Client tự thay đổi giá sản phẩm
            item.unit_price = Number(product.ai_price);
            computedSubtotal += Number(product.ai_price) * item.quantity;
            productsToUpdate.push({ id: item.product_id, quantity: item.quantity });
          }
        } else {
          throw new Error('Đơn hàng phải chứa ít nhất 1 sản phẩm');
        }

        // 2. Xác thực Voucher (nếu có voucher_id) và tính toán discount
        if (voucherId) {
          const userVouchers = await sql`
            SELECT uv.used_at, v.discount_type, v.discount_value::numeric, v.max_discount::numeric, v.min_order::numeric, v.valid_until, v.valid_from, v.store_id
            FROM user_vouchers uv
            JOIN vouchers v ON uv.voucher_id = v.id
            WHERE uv.user_id = ${userId} AND uv.voucher_id = ${voucherId}
          `;

          if (userVouchers.length === 0) {
            throw new Error('Bạn không sở hữu voucher này hoặc voucher không hợp lệ');
          }

          const uv = userVouchers[0];
          if (uv.used_at) {
            throw new Error('Voucher này đã được sử dụng trước đó');
          }

          // Kiểm tra hạn sử dụng của voucher
          if (uv.valid_until && new Date(uv.valid_until).getTime() < Date.now()) {
            throw new Error('Voucher này đã hết hạn sử dụng');
          }
          if (uv.valid_from && new Date(uv.valid_from).getTime() > Date.now()) {
            throw new Error('Voucher chưa đến thời gian áp dụng');
          }

          // Kiểm tra điều kiện đơn hàng tối thiểu
          const minOrder = Number(uv.min_order || 0);
          if (computedSubtotal < minOrder) {
            throw new Error(`Đơn hàng tối thiểu để dùng voucher này là ${minOrder.toLocaleString('vi-VN')}đ`);
          }

          // Kiểm tra xem voucher có áp dụng cho đúng store của đơn hàng không
          if (uv.store_id && uv.store_id !== orderData.store_id) {
            throw new Error('Voucher không áp dụng cho cửa hàng này');
          }

          // Tính toán giá trị giảm giá thực tế
          if (uv.discount_type === 'percentage') {
            const pctDiscount = Math.round((computedSubtotal * Number(uv.discount_value)) / 100);
            discount = uv.max_discount ? Math.min(pctDiscount, Number(uv.max_discount)) : pctDiscount;
          } else if (uv.discount_type === 'fixed') {
            discount = Number(uv.discount_value);
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

        // 3. Nếu thanh toán qua ví, trừ tiền ví khách hàng atomic
        if (paymentMethod === 'wallet') {
          const userRows = await sql`
            SELECT COALESCE(wallet_balance, 0)::numeric as wallet_balance 
            FROM users WHERE id = ${userId}
          `;

          if (userRows.length === 0) {
            throw new Error('Không thể xác thực thông tin tài khoản người dùng');
          }
          const userBalance = Number(userRows[0].wallet_balance);

          if (userBalance < total) {
            throw new Error('Số dư ví FRESH không đủ để thực hiện thanh toán đơn hàng này');
          }

          // Trừ tiền ví của khách hàng atomic
          const walletUpdate = await sql`
            UPDATE users 
            SET wallet_balance = COALESCE(wallet_balance, 0) - ${total} 
            WHERE id = ${userId} AND COALESCE(wallet_balance, 0) >= ${total}
            RETURNING wallet_balance
          `;
          if (walletUpdate.length === 0) {
            throw new Error('Số dư ví FRESH thay đổi hoặc không đủ, vui lòng đặt hàng lại');
          }

          // Tạo bản ghi giao dịch (transaction) ví cho khách hàng
          const txRecord = {
            id: crypto.randomUUID(),
            user_id: userId,
            type: 'payment',
            amount: -total,
            date: now,
            status: 'completed',
            description: `Thanh toán đơn hàng #${id.substring(0, 8)}`,
            payment_method: 'wallet'
          };
          await sql`
            INSERT INTO transactions ${sql(txRecord, 'id', 'user_id', 'type', 'amount', 'date', 'status', 'description', 'payment_method')}
          `;
        }

        // 4. Cập nhật số lượng sản phẩm (stock) trong kho atomic
        for (const item of productsToUpdate) {
          const stockUpdate = await sql`
            UPDATE products 
            SET stock = stock - ${item.quantity},
                status = CASE WHEN stock - ${item.quantity} = 0 THEN 'out_of_stock'::text ELSE 'live'::text END
            WHERE id = ${item.id} AND stock >= ${item.quantity}
            RETURNING stock
          `;
          if (stockUpdate.length === 0) {
            throw new Error('Một hoặc nhiều sản phẩm thay đổi số lượng tồn kho hoặc đã hết hàng, vui lòng thử lại');
          }
        }

        // 5. Tạo đơn hàng (Order)
        const dbOrder = {
          id,
          user_id: userId,
          store_id: orderData.store_id || null,
          status: 'pending',
          payment_method: orderData.payment_method,
          delivery_method: orderData.delivery_method,
          delivery_address: orderData.delivery_address || null,
          delivery_notes: orderData.delivery_notes || null,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          service_fee: orderData.service_fee,
          discount: orderData.discount,
          total: orderData.total,
          co2_saved: orderData.co2_saved || 0,
          points_earned: orderData.points_earned || 0,
          voucher_id: orderData.voucher_id || null,
          created_at: now,
          estimated_delivery: new Date(Date.now() + 20 * 60000).toISOString()
        };

        await sql`
          INSERT INTO orders ${sql(dbOrder, 'id', 'user_id', 'store_id', 'status', 'payment_method', 'delivery_method', 'delivery_address', 'delivery_notes', 'subtotal', 'delivery_fee', 'service_fee', 'discount', 'total', 'co2_saved', 'points_earned', 'voucher_id', 'created_at', 'estimated_delivery')}
        `;

        // 6. Tạo các sản phẩm trong đơn hàng (Order Items)
        if (orderItemData?.length) {
          const itemsToInsert = orderItemData.map((item: any) => ({
            order_id: id,
            product_id: item.product_id,
            product_name: item.product_name || 'Sản phẩm giải cứu',
            quantity: item.quantity,
            unit_price: item.unit_price
          }));
          await sql`
            INSERT INTO order_items ${sql(itemsToInsert, 'order_id', 'product_id', 'product_name', 'quantity', 'unit_price')}
          `;
        }

        // 7. Cập nhật trạng thái voucher đã sử dụng trong user_vouchers (Đề phòng Double Spending)
        if (voucherId) {
          await sql`
            UPDATE user_vouchers 
            SET used_at = ${now}, order_id = ${id} 
            WHERE user_id = ${userId} AND voucher_id = ${voucherId}
          `;
        }

        // 8. Tạo tracking steps
        const trackingTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const trackingSteps = [
          { order_id: id, status: 'pending', time: trackingTime, completed: true },
          ...statusFlow.slice(1).map(s => ({
            order_id: id,
            status: s,
            time: '',
            completed: false
          }))
        ];
        await sql`
          INSERT INTO tracking_steps ${sql(trackingSteps, 'order_id', 'status', 'time', 'completed')}
        `;
      });
    } catch (dbErr: any) {
      await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 400, Date.now() - startTime);
      return NextResponse.json({ error: dbErr.message || 'Đặt hàng thất bại do lỗi cơ sở dữ liệu' }, { status: 400 });
    }

    // Truy xuất thông tin an toàn trả về Client qua Supabase client
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
      const pointsEarned = orderData.points_earned || Math.floor(orderData.total / 1000);

      sendOrderConfirmationEmail(
        user.email,
        user.name || 'Thành viên',
        id.substring(0, 8).toUpperCase(),
        emailItems,
        orderData.total,
        co2Saved,
        pointsEarned
      ).catch(err => {
        console.error('Failed to send order email:', err);
      });
    }

    await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 201, Date.now() - startTime);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }), { status: 201 });
  } catch (err: any) {
    await logSecurityEvent(req, currentUserId, '/api/orders', 'POST', 500, Date.now() - startTime);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}
