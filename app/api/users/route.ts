import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) return handleError(error);
      const { password, ...safe } = toCamelCase(data || {});
      return NextResponse.json(safe || null);
    }
    const { data, error } = await supabase.from('users').select('*');
    if (error) return handleError(error);
    return NextResponse.json((data || []).map((u: any) => { const { password, ...safe } = toCamelCase(u); return safe; }));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    const { password, ...safe } = toCamelCase(data || {});
    return NextResponse.json(safe);
  } catch (err) { return handleError(err); }
}
