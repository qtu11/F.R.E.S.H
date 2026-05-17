import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error || !order) return NextResponse.json(null, { status: 404 });

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const data = toSnakeCase(await req.json());
    await supabase.from('orders').update(data).eq('id', id);

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }));
  } catch (err) { return handleError(err); }
}
