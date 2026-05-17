import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: orders, error } = await supabase
      .from('orders').select('*').order('created_at', { ascending: false });
    if (error) return handleError(error);

    const enriched = await Promise.all((orders || []).map(async (o: any) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
      const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', o.id);
      return { ...o, items: items || [], trackingSteps: steps || [] };
    }));
    return NextResponse.json(toCamelCase(enriched));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const data = toSnakeCase(await req.json());
    const { items: orderItemData, ...orderData } = data;
    const id = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered'];

    const { error: orderErr } = await supabase.from('orders').insert({
      ...orderData,
      id,
      status: 'pending',
      created_at: now,
      estimated_delivery: new Date(Date.now() + 20 * 60000).toISOString(),
    });
    if (orderErr) return handleError(orderErr);

    if (orderItemData?.length) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        orderItemData.map((item: any) => ({ ...item, order_id: id }))
      );
      if (itemsErr) return handleError(itemsErr);
    }

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const { error: stepsErr } = await supabase.from('tracking_steps').insert([
      { order_id: id, status: 'pending', time, completed: true },
      ...statusFlow.slice(1).map(s => ({ order_id: id, status: s, time: '', completed: false })),
    ]);
    if (stepsErr) return handleError(stepsErr);

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }), { status: 201 });
  } catch (err) { return handleError(err); }
}
