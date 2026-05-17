import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function PATCH(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id, status } = await req.json();
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    await supabase
      .from('tracking_steps')
      .update({ completed: true, time: now })
      .eq('order_id', id)
      .eq('status', status);

    const updateData: any = { status };
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();
    await supabase.from('orders').update(updateData).eq('id', id);

    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
    const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', id);
    return NextResponse.json(toCamelCase({ ...order, items: items || [], trackingSteps: steps || [] }));
  } catch (err) { return handleError(err); }
}
