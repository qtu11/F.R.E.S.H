import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireRole, requireAnyRole, requireAuth, checkStoreAccess } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');
    if (userId) {
      // Yêu cầu đăng nhập khi truy cập ví voucher cá nhân
      const auth = await requireAuth();
      if ('status' in auth) return auth;

      // IDOR check: Chỉ admin hoặc chính chủ mới được xem ví voucher
      if (auth.user.role !== 'admin' && auth.user.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }

      const { data: userVouchers, error } = await supabase
        .from('user_vouchers').select('*, voucher:vouchers(*)').eq('user_id', userId);
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(userVouchers || []));
    }
    let builder = supabase.from('vouchers').select('*');
    if (storeId) builder = builder.eq('store_id', storeId);
    const { data, error } = await builder.order('created_at', { ascending: false });
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['customer', 'partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());

    // 1. Trường hợp claim voucher (nhận voucher cho khách hàng)
    if (body.user_id && body.voucher_id) {
      // Phân quyền & IDOR: Khách hàng chỉ được claim cho chính mình, admin được claim cho tất cả
      if (auth.user.role === 'customer' && body.user_id !== auth.user.userId) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }
      if (auth.user.role === 'partner') {
        return NextResponse.json({ error: 'Partners cannot claim vouchers' }, { status: 403 });
      }

      const { data: existing, error: checkErr } = await supabase.from('user_vouchers').select('*')
        .eq('user_id', body.user_id).eq('voucher_id', body.voucher_id).single();
      if (checkErr && checkErr.code !== 'PGRST116') return handleError(checkErr);
      if (existing) return NextResponse.json({ error: 'Already claimed' }, { status: 400 });

      const { data: voucher, error: voucherErr } = await supabase.from('vouchers').select('*').eq('id', body.voucher_id).single();
      if (voucherErr) return handleError(voucherErr);
      
      if (voucher) {
        if (voucher.used_count >= voucher.usage_limit) {
          return NextResponse.json({ error: 'Voucher exhausted' }, { status: 400 });
        }
        if (voucher.valid_until && new Date(voucher.valid_until).getTime() < Date.now()) {
          return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 });
        }
        if (voucher.valid_from && new Date(voucher.valid_from).getTime() > Date.now()) {
          return NextResponse.json({ error: 'Voucher is not active yet' }, { status: 400 });
        }
      }
      const { error: claimErr } = await supabase.from('user_vouchers').insert({
        user_id: body.user_id, voucher_id: body.voucher_id, claimed_at: new Date().toISOString(),
      });
      if (claimErr) return handleError(claimErr);

      const { error: updateErr } = await supabase.from('vouchers').update({ used_count: (voucher?.used_count || 0) + 1 }).eq('id', body.voucher_id);
      if (updateErr) return handleError(updateErr);

      return NextResponse.json({ success: true });
    }

    // 2. Trường hợp tạo voucher mới (chỉ admin hoặc partner được phép)
    if (auth.user.role === 'customer') {
      return NextResponse.json({ error: 'Unauthorized: Customers cannot create vouchers' }, { status: 403 });
    }

    // Nếu là partner, voucher tạo ra phải gắn với store của họ
    if (auth.user.role === 'partner') {
      const { data: user } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', auth.user.userId)
        .maybeSingle();

      if (!user?.organization_id) {
        return NextResponse.json({ error: 'Partner store not configured' }, { status: 400 });
      }

      const { data: branch } = await supabase
        .from('organization_branches')
        .select('store_id')
        .eq('organization_id', user.organization_id)
        .maybeSingle();

      if (!branch?.store_id) {
        return NextResponse.json({ error: 'Partner store not configured' }, { status: 400 });
      }

      body.store_id = branch.store_id;
    }

    const newVoucher = { ...body, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('vouchers').insert(newVoucher).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']); // Chỉ cho phép partner hoặc admin cập nhật trạng thái voucher trực tiếp
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const { voucher_id, user_id, used_at, order_id } = body;

    if (!voucher_id || !user_id) {
      return NextResponse.json({ error: 'voucher_id and user_id are required' }, { status: 400 });
    }

    // Kiểm tra quyền hạn đối tác đối với voucher (IDOR check)
    if (auth.user.role === 'partner') {
      const { data: voucher } = await supabase
        .from('vouchers')
        .select('store_id')
        .eq('id', voucher_id)
        .maybeSingle(); // Dùng maybeSingle tránh ném lỗi single
      
      if (!voucher) {
        return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 });
      }

      if (voucher.store_id) {
        const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, voucher.store_id);
        if (!hasAccess) {
          return NextResponse.json({ error: 'Bạn không có quyền cập nhật voucher này' }, { status: 403 });
        }
      }
    }

    await supabase.from('user_vouchers').update({ used_at, order_id })
      .eq('user_id', user_id).eq('voucher_id', voucher_id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
