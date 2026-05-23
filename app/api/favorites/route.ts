import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || auth.user.userId;

    // IDOR check: Chỉ cho phép xem favorites của chính mình hoặc admin
    if (auth.user.role !== 'admin' && auth.user.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('favorites').select('*, product:products(*)').eq('user_id', userId).order('created_at', { ascending: false });
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

    const { productId } = await req.json();
    const targetUserId = auth.user.userId; // Luôn dùng userId từ token để tránh IDOR

    const { error } = await supabase.from('favorites').insert({
      user_id: targetUserId, product_id: productId, created_at: new Date().toISOString(),
    });
    if (error) return handleError(error);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { productId } = await req.json();
    const targetUserId = auth.user.userId; // Luôn dùng userId từ token để tránh IDOR

    const { error } = await supabase.from('favorites').delete().eq('user_id', targetUserId).eq('product_id', productId);
    if (error) return handleError(error);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
