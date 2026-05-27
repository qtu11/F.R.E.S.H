import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // 1. Lấy auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) return handleError(authError);

    const authUsers = authData?.users || [];
    const authUserIds = new Set(authUsers.map(u => u.id));

    // 2. Lấy db users
    const { data: dbUsers, error: dbError } = await supabase.from('users').select('id,role,status,email');
    if (dbError) return handleError(dbError);

    const adminEmail = process.env.ADMIN_LOGIN?.toLowerCase();

    // 3. Chỉ giữ lại những user thực sự trong Auth + admin từ env
    const filtered = (dbUsers || []).filter(u => {
      const isAuthUser = authUserIds.has(u.id);
      const isEnvAdmin = u.email?.toLowerCase() === adminEmail;
      return isAuthUser || isEnvAdmin;
    });

    return NextResponse.json({
      total: filtered.length,
      customers: filtered.filter((u: any) => u.role === 'customer').length,
      partners: filtered.filter((u: any) => u.role === 'partner').length,
      admins: filtered.filter((u: any) => u.role === 'admin').length,
      active: filtered.filter((u: any) => u.status === 'active').length,
      suspended: filtered.filter((u: any) => u.status === 'suspended').length,
      banned: filtered.filter((u: any) => u.status === 'banned').length,
    });
  } catch (err) { return handleError(err); }
}
