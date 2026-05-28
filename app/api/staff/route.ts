import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAnyRole, checkStoreAccess } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    let builder = supabase.from('staff_members').select('*');
    if (storeId) builder = builder.eq('store_id', storeId);
    const { data, error } = await builder.order('created_at', { ascending: false });
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());

    if (!body.store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, body.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    const newStaff = { ...body, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('staff_members').insert(newStaff).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Lấy thông tin store_id của nhân viên để kiểm tra quyền
    const { data: staff, error: getErr } = await supabase
      .from('staff_members')
      .select('store_id')
      .eq('id', id)
      .single();

    if (getErr || !staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, staff.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    const { data: result, error } = await supabase.from('staff_members').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result));
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Lấy thông tin store_id của nhân viên để kiểm tra quyền
    const { data: staff, error: getErr } = await supabase
      .from('staff_members')
      .select('store_id')
      .eq('id', id)
      .single();

    if (getErr || !staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Kiểm tra quyền hạn Store Access (IDOR check)
    const hasAccess = await checkStoreAccess(auth.user.userId, auth.user.role, staff.store_id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized: You do not have access to this store' }, { status: 403 });
    }

    const { error } = await supabase.from('staff_members').delete().eq('id', id);
    if (error) return handleError(error);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
