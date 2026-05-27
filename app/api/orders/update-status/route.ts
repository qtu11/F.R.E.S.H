import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAnyRole, checkStoreAccess } from '@/lib/auth/middleware';
import crypto from 'crypto';

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id, status } = await req.json();
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    // Lấy thông tin đơn hàng hiện tại
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    if (auth.user.role === 'partner') {
      const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, order.store_id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Bạn không có quyền cập nhật đơn hàng này' }, { status: 403 });
      }
    }

    const previousStatus = order.status;

    // 1. Cập nhật tracking_steps
    await supabase
      .from('tracking_steps')
      .update({ completed: true, time: nowTime })
      .eq('order_id', id)
      .eq('status', status);

    // 2. Cập nhật trạng thái đơn hàng
    const updateData: any = { status };
    if (status === 'delivered') updateData.delivered_at = nowIso;
    const { error: updErr } = await supabase.from('orders').update(updateData).eq('id', id);
    if (updErr) return handleError(updErr);

    // 3. Xử lý logic nếu trạng thái chuyển sang 'delivered' (Giao thành công)
    if (status === 'delivered' && previousStatus !== 'delivered') {
      // Lấy danh sách sản phẩm trong đơn hàng
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      // Tính toán ESG
      let totalQty = 0;
      if (items && items.length > 0) {
        for (const item of items) {
          totalQty += item.quantity || 0;
        }
      }
      const foodRescuedAdded = totalQty * 0.5; // Mỗi sản phẩm = 0.5 kg thức ăn
      const co2ReducedAdded = foodRescuedAdded * 1.2; // Mỗi kg thức ăn = 1.2 kg CO2
      const greenPointsAdded = Math.max(10, Math.round(order.total / 1000));

      // Cập nhật ESG cho khách hàng
      const { data: customer } = await supabase
        .from('users')
        .select('*')
        .eq('id', order.user_id)
        .single();

      if (customer) {
        await supabase
          .from('users')
          .update({
            green_points: (customer.green_points || 0) + greenPointsAdded,
            food_rescued: (customer.food_rescued || 0) + foodRescuedAdded,
            co2_reduced: (customer.co2_reduced || 0) + co2ReducedAdded,
            total_orders: (customer.total_orders || 0) + 1,
            total_spent: (customer.total_spent || 0) + order.total,
          })
          .eq('id', order.user_id);

        // Lưu points history
        await supabase.from('points_history').insert({
          user_id: order.user_id,
          points: greenPointsAdded,
          type: 'earned',
          source: 'rescue',
          reference_id: id,
          description: `Giải cứu thức ăn đơn hàng #${id.substring(0, 8)}`,
          created_at: nowIso,
        });
      }

      // Cập nhật ví đối tác (Cộng tiền doanh thu)
      let partnerUserId = null;

      // Tìm partner user_id qua organization_branches → organization_members
      const { data: branch } = await supabase
        .from('organization_branches')
        .select('organization_id')
        .eq('store_id', order.store_id)
        .maybeSingle();

      if (branch?.organization_id) {
        const { data: owner } = await supabase
          .from('organizations')
          .select('owner_id')
          .eq('id', branch.organization_id)
          .single();

        if (owner) {
          partnerUserId = owner.owner_id;
        }
      }

      if (!partnerUserId) {
        // Fallback: tìm qua store name và user name
        const { data: store } = await supabase
          .from('stores')
          .select('name')
          .eq('id', order.store_id)
          .single();

        if (store) {
          const { data: partnerUser } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'partner')
            .eq('name', store.name)
            .maybeSingle();

          if (partnerUser) {
            partnerUserId = partnerUser.id;
          }
        }
      }

      if (partnerUserId) {
        const { data: partnerUser } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', partnerUserId)
          .single();

        if (partnerUser) {
          const newPartnerBalance = (partnerUser.wallet_balance || 0) + order.total;
          await supabase
            .from('users')
            .update({ wallet_balance: newPartnerBalance })
            .eq('id', partnerUserId);

          // Tạo transaction doanh thu cho đối tác
          await supabase.from('transactions').insert({
            id: crypto.randomUUID(),
            user_id: partnerUserId,
            type: 'revenue',
            amount: order.total,
            date: nowIso,
            status: 'completed',
            description: `Doanh thu đơn hàng #${id.substring(0, 8)}`,
            payment_method: order.payment_method || 'wallet',
          });
        }
      }

      // Cập nhật bảng esg_metrics toàn hệ thống cho ngày hôm nay
      const todayDate = nowIso.split('T')[0];
      const { data: metric } = await supabase
        .from('esg_metrics')
        .select('*')
        .eq('date', todayDate)
        .maybeSingle();

      if (metric) {
        await supabase
          .from('esg_metrics')
          .update({
            food_rescued_kg: (metric.food_rescued_kg || 0) + foodRescuedAdded,
            co2_reduced_kg: (metric.co2_reduced_kg || 0) + co2ReducedAdded,
            meals_saved: (metric.meals_saved || 0) + totalQty,
            total_orders: (metric.total_orders || 0) + 1,
          })
          .eq('id', metric.id);
      } else {
        await supabase.from('esg_metrics').insert({
          date: todayDate,
          food_rescued_kg: foodRescuedAdded,
          co2_reduced_kg: co2ReducedAdded,
          meals_saved: totalQty,
          total_orders: 1,
        });
      }
    }

    // 4. Xử lý logic nếu trạng thái chuyển sang 'cancelled' (Hủy đơn)
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      // Cộng lại tồn kho sản phẩm
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (items && items.length > 0) {
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            const newStock = (product.stock || 0) + item.quantity;
            await supabase
              .from('products')
              .update({
                stock: newStock,
                status: 'live',
              })
              .eq('id', item.product_id);
          }
        }
      }

      // Hoàn tiền cho khách hàng nếu thanh toán bằng ví (wallet)
      if (order.payment_method === 'wallet') {
        const { data: customer } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', order.user_id)
          .single();

        if (customer) {
          const newCustBalance = (customer.wallet_balance || 0) + order.total;
          await supabase
            .from('users')
            .update({ wallet_balance: newCustBalance })
            .eq('id', order.user_id);

          // Tạo transaction hoàn tiền cho khách hàng
          await supabase.from('transactions').insert({
            id: crypto.randomUUID(),
            user_id: order.user_id,
            type: 'refund',
            amount: order.total,
            date: nowIso,
            status: 'completed',
            description: `Hoàn tiền hủy đơn hàng #${id.substring(0, 8)}`,
            payment_method: 'wallet',
          });
        }
      }
    }

    const { data: updatedOrder } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...updatedOrder, items: items || [], trackingSteps: steps || [] }));
  } catch (err) { return handleError(err); }
}
