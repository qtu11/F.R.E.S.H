import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAnyRole } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    if (auth.user.role === 'admin') {
      const { data, error } = await supabase.from('organization_branches').select('*').order('created_at', { ascending: false });
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(data || []));
    }

    const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).single();
    if (!user?.organization_id) return NextResponse.json([]);

    const { data, error } = await supabase.from('organization_branches').select('*').eq('organization_id', user.organization_id);
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

    const body = await req.json();
    const { name, address, phone, organizationId } = body;
    if (!name || !organizationId) {
      return NextResponse.json({ error: 'name and organizationId are required' }, { status: 400 });
    }

    // Partners can only create branches for their own org
    if (auth.user.role === 'partner') {
      const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).single();
      if (user?.organization_id !== organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const branchId = `BR_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { data, error } = await supabase.from('organization_branches').insert({
      id: branchId,
      organization_id: organizationId,
      name,
      address: address || null,
      phone: phone || null,
      status: 'active',
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}
