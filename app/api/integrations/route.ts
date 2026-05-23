import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAnyRole } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const logs = searchParams.get('logs');
    if (logs && storeId) {
      const { data, error } = await supabase.from('webhook_logs')
        .select('*, integration:integrations(*)')
        .eq('integration_id', logs)
        .order('created_at', { ascending: false }).limit(50);
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(data || []));
    }
    let builder = supabase.from('integrations').select('*');
    if (storeId) builder = builder.eq('store_id', storeId);
    const { data, error } = await builder;
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    if (body.event) {
      const newLog = { ...body, created_at: new Date().toISOString() };
      const { data, error } = await supabase.from('webhook_logs').insert(newLog).select().single();
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(data), { status: 201 });
    }
    const newIntegration = { ...body, id: crypto.randomUUID(), connected_at: new Date().toISOString(), last_sync_at: new Date().toISOString() };
    const { data, error } = await supabase.from('integrations').insert(newIntegration).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;
    updates.last_sync_at = new Date().toISOString();
    const { data, error } = await supabase.from('integrations').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const { id } = await req.json();
    await supabase.from('integrations').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
