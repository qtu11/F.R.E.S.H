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
    const type = searchParams.get('type');

    let builder = supabase.from('transactions').select('*').order('date', { ascending: false });
    if (userId) builder = builder.eq('user_id', userId);
    if (type) builder = builder.eq('type', type);

    const { data, error } = await builder;
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const newTx = { ...body, id: `t${Date.now()}` };
    const { error: txErr } = await supabase.from('transactions').insert(newTx);
    if (txErr) return handleError(txErr);

    if (body.user_id) {
      const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', body.user_id).single();
      if (user) {
        const newBalance = (user.wallet_balance || 0) + body.amount;
        await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', body.user_id);
      }
    }
    return NextResponse.json(toCamelCase(newTx), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id } = await req.json();
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (tx?.user_id) {
      const { data: user } = await supabase.from('users').select('wallet_balance').eq('id', tx.user_id).single();
      if (user) {
        await supabase.from('users').update({ wallet_balance: (user.wallet_balance || 0) - (tx.amount || 0) }).eq('id', tx.user_id);
      }
    }
    await supabase.from('transactions').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
