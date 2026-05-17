import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const { data, error } = await supabase.from('bank_accounts').select('*').eq('user_id', userId);
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(data || []));
    }
    return NextResponse.json([]);
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const newAccount = { ...body, id: `ba-${Date.now()}`, added_at: new Date().toISOString() };

    if (newAccount.is_default) {
      await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', newAccount.user_id);
    }
    const { data: result, error } = await supabase.from('bank_accounts').insert(newAccount).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id } = await req.json();
    await supabase.from('bank_accounts').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, is_default, user_id } = body;
    if (is_default && user_id) {
      await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', user_id);
    }
    await supabase.from('bank_accounts').update({ is_default }).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
