import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json([]);

    const { data: orders, error } = await supabase
      .from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return handleError(error);

    const enriched = await Promise.all((orders || []).map(async (o: any) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', o.id);
      const { data: steps } = await supabase.from('tracking_steps').select('*').eq('order_id', o.id);
      return { ...o, items: items || [], trackingSteps: steps || [] };
    }));
    return NextResponse.json(toCamelCase(enriched));
  } catch (err) { return handleError(err); }
}
