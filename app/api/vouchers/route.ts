import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireRole, requireAnyRole } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const storeId = searchParams.get('storeId');
    if (userId) {
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
      if (voucher && voucher.used_count >= voucher.usage_limit) return NextResponse.json({ error: 'Voucher exhausted' }, { status: 400 });

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
      const { data: partner } = await supabase
        .from('partners')
        .select('store_id')
        .eq('user_id', auth.user.userId)
        .maybeSingle();

      if (!partner || !partner.store_id) {
        return NextResponse.json({ error: 'Partner store not configured' }, { status: 400 });
      }

      body.store_id = partner.store_id;
    }

    const newVoucher = { ...body, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('vouchers').insert(newVoucher).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['customer', 'partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;

    // Phân quyền & IDOR: Khách hàng chỉ được cập nhật voucher của chính mình, admin được phép cập nhật tất cả
    if (auth.user.role === 'customer' && updates.user_id !== auth.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    await supabase.from('user_vouchers').update({ used_at: updates.used_at, order_id: updates.order_id })
      .eq('user_id', updates.user_id).eq('voucher_id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
