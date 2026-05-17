import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function POST(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { ticketId, from, message } = await req.json();
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    await supabase.from('ticket_responses').insert({ ticket_id: ticketId, from_text: from, message, time });

    const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', ticketId).single();
    const { data: responses } = await supabase.from('ticket_responses').select('*').eq('ticket_id', ticketId).order('id', { ascending: true });
    return NextResponse.json(toCamelCase({ ...ticket, responses: responses || [] }));
  } catch (err) { return handleError(err); }
}
