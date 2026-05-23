import { NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

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
