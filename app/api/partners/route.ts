import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data, error } = await supabase.from('partners').select('*');
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;
    if (updates.status === 'approved') updates.approved_at = new Date().toISOString();
    const { data, error } = await supabase.from('partners').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}
