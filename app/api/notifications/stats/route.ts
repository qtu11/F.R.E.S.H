import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ total: 0, unread: 0, deals: 0, orders: 0, vouchers: 0 });

    const { data, error } = await supabase.from('notifications').select('*');
    if (error) return handleError(error);

    const all = data || [];
    return NextResponse.json({
      total: all.length,
      unread: all.filter((n: any) => !n.read).length,
      deals: all.filter((n: any) => n.type === 'deal').length,
      orders: all.filter((n: any) => n.type === 'order').length,
      vouchers: all.filter((n: any) => n.type === 'voucher').length,
    });
  } catch (err) { return handleError(err); }
}
