import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { data, error } = await supabase.from('users').select('role,status');
    if (error) return handleError(error);

    const all = data || [];
    return NextResponse.json({
      total: all.length,
      customers: all.filter((u: any) => u.role === 'customer').length,
      partners: all.filter((u: any) => u.role === 'partner').length,
      admins: all.filter((u: any) => u.role === 'admin').length,
      active: all.filter((u: any) => u.status === 'active').length,
      suspended: all.filter((u: any) => u.status === 'suspended').length,
      banned: all.filter((u: any) => u.status === 'banned').length,
    });
  } catch (err) { return handleError(err); }
}
