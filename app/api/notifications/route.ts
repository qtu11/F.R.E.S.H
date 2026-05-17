import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread');

    let builder = supabase.from('notifications').select('*').order('time', { ascending: false });
    if (type) builder = builder.eq('type', type);
    if (unreadOnly === 'true') builder = builder.eq('read', false);

    const { data, error } = await builder;
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id, markAll } = await req.json();
    if (markAll) {
      await supabase.from('notifications').update({ read: true }).neq('id', 'none');
    } else if (id) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id } = await req.json();
    await supabase.from('notifications').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
