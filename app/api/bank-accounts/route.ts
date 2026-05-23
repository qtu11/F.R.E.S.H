import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || auth.user.userId;

    // IDOR check: Chỉ cho phép truy cập tài khoản của chính mình hoặc admin
    if (auth.user.role !== 'admin' && auth.user.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    const { data, error } = await supabase.from('bank_accounts').select('*').eq('user_id', userId);
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    
    // Ghi đè user_id để tránh người dùng giả mạo user_id của người khác
    const targetUserId = auth.user.role === 'admin' ? (body.user_id || auth.user.userId) : auth.user.userId;
    
    const newAccount = { 
      ...body, 
      id: crypto.randomUUID(), 
      user_id: targetUserId,
      added_at: new Date().toISOString() 
    };

    if (newAccount.is_default) {
      await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', targetUserId);
    }
    const { data: result, error } = await supabase.from('bank_accounts').insert(newAccount).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id } = await req.json();

    // IDOR check: Chỉ admin hoặc chủ sở hữu tài khoản mới được xóa
    if (auth.user.role !== 'admin') {
      const { data: acc } = await supabase.from('bank_accounts').select('user_id').eq('id', id).single();
      if (acc && acc.user_id !== auth.user.userId) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }
    }

    await supabase.from('bank_accounts').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, is_default } = body;

    // IDOR check: Chỉ admin hoặc chủ sở hữu tài khoản mới được cập nhật
    const { data: acc } = await supabase.from('bank_accounts').select('user_id').eq('id', id).single();
    if (!acc) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    if (auth.user.role !== 'admin' && acc.user_id !== auth.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    if (is_default) {
      await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', acc.user_id);
    }
    await supabase.from('bank_accounts').update({ is_default }).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
