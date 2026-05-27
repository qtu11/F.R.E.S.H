import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAnyRole } from '@/lib/auth/middleware';

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { organizationId, email, role } = await req.json();

    if (!organizationId || !email || !role) {
      return NextResponse.json({ error: 'organizationId, email, and role are required' }, { status: 400 });
    }

    if (!['admin', 'manager', 'accountant', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Partners can only invite members to their own org
    if (auth.user.role === 'partner') {
      const { data: user } = await supabase.from('users').select('organization_id').eq('id', auth.user.userId).single();
      if (user?.organization_id !== organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Find user by email
    const { data: targetUser } = await supabase.from('users').select('id, name, email').eq('email', email.toLowerCase()).single();
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found. They need to register first.' }, { status: 404 });
    }

    // Check not already a member
    const { data: existing } = await supabase.from('organization_members')
      .select('id').eq('organization_id', organizationId).eq('user_id', targetUser.id).single();
    if (existing) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const memberId = `OM_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { data, error } = await supabase.from('organization_members').insert({
      id: memberId,
      organization_id: organizationId,
      user_id: targetUser.id,
      role,
      invited_by: auth.user.userId,
      invited_at: now,
      status: 'active',
      permissions: JSON.stringify([]),
    }).select().single();

    if (error) return handleError(error);

    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}
