import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let builder = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (status) builder = builder.eq('status', status);

    const { data: tickets, error } = await builder;
    if (error) return handleError(error);

    const enriched = await Promise.all((tickets || []).map(async (t: any) => {
      const { data: responses } = await supabase.from('ticket_responses').select('*').eq('ticket_id', t.id);
      return { ...t, responses: responses || [] };
    }));
    return NextResponse.json(toCamelCase(enriched));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;
    await supabase.from('support_tickets').update(updates).eq('id', id);

    const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', id).single();
    const { data: responses } = await supabase.from('ticket_responses').select('*').eq('ticket_id', id);
    return NextResponse.json(toCamelCase({ ...ticket, responses: responses || [] }));
  } catch (err) { return handleError(err); }
}
