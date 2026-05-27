import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone, organizationName, taxCode, address } = body;

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json({ error: 'Email, password, name, and organization name are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name, role: 'partner' },
    });
    if (authError) {
      return NextResponse.json({ error: authError.message || 'Failed to create auth account' }, { status: 400 });
    }

    const userId = authData.user.id;
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();
    const orgId = `ORG_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Insert user into public.users FIRST so the FK from organizations.owner_id works
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'partner',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      phone: phone || null,
      address: address || null,
      join_date: now,
      last_active: now,
      status: 'active',
      green_points: 0,
      food_rescued: 0,
      co2_reduced: 0,
      total_orders: 0,
      total_spent: 0,
      wallet_balance: 0,
    };

    const { data: dbUser, error: dbError } = await supabase.from('users').upsert(newUser, { onConflict: 'id' }).select().single();
    if (dbError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create user profile: ' + dbError.message }, { status: 500 });
    }

    const orgResult = await supabase.from('organizations').insert({
      id: orgId,
      name: organizationName,
      tax_code: taxCode || null,
      address: address || null,
      phone: phone || null,
      email: email.toLowerCase(),
      status: 'pending',
      owner_id: userId,
      created_at: now,
    }).select().single();

    if (orgResult.error) {
      await supabase.from('users').delete().eq('id', userId);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create organization: ' + orgResult.error.message }, { status: 500 });
    }

    // Link user back to organization
    await supabase.from('users').update({ organization_id: orgId }).eq('id', userId);

    await supabase.from('organization_members').insert({
      id: `OM_${Date.now()}`,
      organization_id: orgId,
      user_id: userId,
      role: 'admin',
      invited_by: userId,
      invited_at: now,
      joined_at: now,
      status: 'active',
      permissions: JSON.stringify(['*']),
    });

    // Re-fetch user to get the updated organization_id
    const { data: updatedUser } = await supabase.from('users').select().eq('id', userId).single();
    const { password: _, ...user } = toCamelCase(updatedUser || dbUser);
    const token = signToken(dbUser.id, dbUser.role);

    const response = NextResponse.json({
      user: { ...user, storeId: null },
      token,
      organization: toCamelCase(orgResult.data),
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Partner register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
