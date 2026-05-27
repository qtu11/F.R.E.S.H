import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAnyRole } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    if (auth.user.role === 'admin') {
      const { data, error } = await supabase
        .from('partner_documents')
        .select('*, organization:organization_id(name)')
        .order('uploaded_at', { ascending: false });
      if (error) return handleError(error);
      return NextResponse.json(toCamelCase(data || []));
    }

    const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).single();
    if (!user?.organization_id) return NextResponse.json([]);

    const { data, error } = await supabase.from('partner_documents').select('*').eq('organization_id', user.organization_id);
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}
