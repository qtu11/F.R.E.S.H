import { NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { getServerClient } from '@/lib/supabase/server';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return decoded;
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return { user };
}

export async function requireRole(role: string) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;
  if (auth.user.role !== role) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return auth;
}

export async function requireAnyRole(roles: string[]) {
  const auth = await requireAuth();
  if ('status' in auth) return auth;
  if (!roles.includes(auth.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return auth;
}

export async function checkStoreAccess(userId: string, role: string, storeId: string): Promise<boolean> {
  if (role === 'admin') return true;
  if (role !== 'partner') return false;

  const supabase = getServerClient();
  if (!supabase) return false;

  const { data: branch } = await supabase
    .from('organization_branches')
    .select('organization_id')
    .eq('store_id', storeId)
    .maybeSingle();

  if (!branch) return false;

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', branch.organization_id)
    .eq('owner_id', userId)
    .maybeSingle();

  if (org) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', branch.organization_id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('role', ['admin', 'manager'])
    .maybeSingle();

  if (member) return true;

  return false;
}
