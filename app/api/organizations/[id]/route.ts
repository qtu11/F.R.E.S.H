import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAnyRole, getAuthenticatedUser } from '@/lib/auth/middleware';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAnyRole(['admin', 'partner']);
    if ('status' in auth) return auth;

    const { id } = await params;
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // Partner users can only view their own org
    if (auth.user.role === 'partner') {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', id)
        .eq('user_id', auth.user.userId)
        .single();
      if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*, owner:owner_id(name, email)')
      .eq('id', id)
      .single();

    if (error) return handleError(error);
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    const [docsResult, membersResult] = await Promise.all([
      supabase.from('partner_documents').select('*').eq('organization_id', id),
      supabase.from('organization_members').select('*, user:user_id(name, email)').eq('organization_id', id),
    ]);

    return NextResponse.json({
      ...toCamelCase(org),
      documents: toCamelCase(docsResult.data || []),
      members: toCamelCase(membersResult.data || []),
    });
  } catch (err) { return handleError(err); }
}
