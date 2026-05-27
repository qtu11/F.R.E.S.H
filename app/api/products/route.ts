import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAnyRole } from '@/lib/auth/middleware';
import { applyRescueCatalogImages } from '@/lib/data/rescue-products';

function withCatalogImages<T>(data: T): T {
  return applyRescueCatalogImages(data as { id?: string; image?: string }[] | { id?: string; image?: string } | null) as T;
}

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

    if (id) return NextResponse.json(withCatalogImages(toCamelCase(data?.[0] || null)));
    if (query) {
      const q = query.toLowerCase();
      const filtered = (data || []).filter((p: any) =>
        p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.store_name?.toLowerCase().includes(q)
      );
      return NextResponse.json(withCatalogImages(toCamelCase(filtered)));
    }
    if (nearby) {
      const maxDist = parseFloat(nearby);
      return NextResponse.json(withCatalogImages(toCamelCase((data || []).filter((p: any) => (p.distance ?? 999) <= maxDist))));
    }
    if (topRated) {
      return NextResponse.json(withCatalogImages(toCamelCase([...(data || [])].sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, parseInt(topRated)))));
    }
    if (endingSoon) {
      const hours = parseInt(endingSoon);
      const now = new Date();
      const threshold = new Date(now.getTime() + hours * 3600000);
      return NextResponse.json(withCatalogImages(toCamelCase((data || []).filter((p: any) => {
        const expiry = new Date(p.expiry);
        return expiry <= threshold && expiry > now;
      }).sort((a: any, b: any) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()))));
    }

    return NextResponse.json(withCatalogImages(toCamelCase(data || [])));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const rawBody = await req.json();
    const nutrition = typeof rawBody.nutrition === 'object' ? { ...rawBody.nutrition } : {};
    if (rawBody.description) nutrition.description = rawBody.description;
    if (rawBody.details) nutrition.details = rawBody.details;
    if (rawBody.mfgDate) nutrition.mfgDate = rawBody.mfgDate;
    if (rawBody.expiryDate) nutrition.expiryDate = rawBody.expiryDate;

    // Auto-resolve store_id for partner users if missing or empty
    let storeId = rawBody.storeId || rawBody.store_id;
    if (!storeId && auth.user.role === 'partner') {
      const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).maybeSingle();
      if (user?.organization_id) {
        const { data: branch } = await supabase.from('organization_branches').select('store_id').eq('organization_id', user.organization_id).maybeSingle();
        storeId = branch?.store_id;
      }
    }
    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    const cleanBody = {
      ...rawBody,
      store_id: storeId,
      nutrition: JSON.stringify(nutrition)
    };
    delete cleanBody.description;
    delete cleanBody.details;
    delete cleanBody.mfgDate;
    delete cleanBody.expiryDate;
    delete cleanBody.storeId;

    const data = toSnakeCase(cleanBody);
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

    const rawBody = await req.json();
    
    // Đóng gói update vào nutrition
    const nutrition = typeof rawBody.nutrition === 'object' ? { ...rawBody.nutrition } : {};
    if (rawBody.description !== undefined) nutrition.description = rawBody.description;
    if (rawBody.details !== undefined) nutrition.details = rawBody.details;
    if (rawBody.mfgDate !== undefined) nutrition.mfgDate = rawBody.mfgDate;
    if (rawBody.expiryDate !== undefined) nutrition.expiryDate = rawBody.expiryDate;

    const cleanBody = {
      ...rawBody,
      nutrition: JSON.stringify(nutrition)
    };
    delete cleanBody.description;
    delete cleanBody.details;
    delete cleanBody.mfgDate;
    delete cleanBody.expiryDate;

    const body = toSnakeCase(cleanBody);
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
