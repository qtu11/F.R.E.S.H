import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).single();
    if (!user?.organization_id) {
      return NextResponse.json(null);
    }

    const { data, error } = await supabase.from('organizations').select('*').eq('id', user.organization_id).single();
    if (error) return handleError(error);
    if (!data) return NextResponse.json(null);

    const { data: docs } = await supabase.from('partner_documents').select('*').eq('organization_id', data.id);
    const { data: branches } = await supabase.from('organization_branches').select('*').eq('organization_id', data.id);

    return NextResponse.json({
      ...toCamelCase(data),
      documents: toCamelCase(docs || []),
      branches: toCamelCase(branches || []),
    });
  } catch (err) { return handleError(err); }
}
