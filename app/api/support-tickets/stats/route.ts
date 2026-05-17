import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ open: 0, resolved: 0, escalated: 0, urgent: 0 });

    const { data, error } = await supabase.from('support_tickets').select('status,priority');
    if (error) return handleError(error);

    const all = data || [];
    return NextResponse.json({
      open: all.filter((t: any) => t.status === 'open').length,
      resolved: all.filter((t: any) => t.status === 'resolved').length,
      escalated: all.filter((t: any) => t.status === 'escalated').length,
      urgent: all.filter((t: any) => t.priority === 'Urgent').length,
    });
  } catch (err) { return handleError(err); }
}
