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
    const id = searchParams.get('id');
    const storeId = searchParams.get('storeId');
    const live = searchParams.get('live');
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const nearby = searchParams.get('nearby');
    const topRated = searchParams.get('topRated');
    const endingSoon = searchParams.get('endingSoon');

    let builder = supabase.from('products').select('*');

    if (id) builder = builder.eq('id', id);
    else if (storeId) builder = builder.eq('store_id', storeId);
    else if (live === 'true') builder = builder.eq('status', 'live').gt('stock', 0);
    else if (category && category !== 'All') builder = builder.eq('category', category).eq('status', 'live').gt('stock', 0);

    const { data, error } = await builder;
    if (error) return handleError(error);

    if (id) return NextResponse.json(toCamelCase(data?.[0] || null));
    if (query) {
      const q = query.toLowerCase();
      const filtered = (data || []).filter((p: any) =>
        p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.store_name?.toLowerCase().includes(q)
      );
      return NextResponse.json(toCamelCase(filtered));
    }
    if (nearby) {
      const maxDist = parseFloat(nearby);
      return NextResponse.json(toCamelCase((data || []).filter((p: any) => (p.distance ?? 999) <= maxDist)));
    }
    if (topRated) {
      return NextResponse.json(toCamelCase([...(data || [])].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, parseInt(topRated))));
    }
    if (endingSoon) {
      const hours = parseInt(endingSoon);
      const now = new Date();
      const threshold = new Date(now.getTime() + hours * 3600000);
      return NextResponse.json(toCamelCase((data || []).filter((p: any) => {
        const expiry = new Date(p.expiry);
        return expiry <= threshold && expiry > now;
      }).sort((a: any, b: any) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())));
    }

    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const data = toSnakeCase(await req.json());
    const newProduct = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('products').insert(newProduct).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
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
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
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
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return handleError(error);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
