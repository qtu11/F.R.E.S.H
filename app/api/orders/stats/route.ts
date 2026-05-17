import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data, error } = await supabase.from('orders').select('status');
    if (error) return handleError(error);

    const all = data || [];
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled'] as const;
    const stats: Record<string, number> = { total: all.length };
    statuses.forEach(s => { stats[s] = all.filter((o: any) => o.status === s).length; });
    return NextResponse.json(stats);
  } catch (err) { return handleError(err); }
}
