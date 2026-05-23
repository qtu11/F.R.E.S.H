import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { requireRole } from '@/lib/auth/middleware';

const MODULES = ['Dashboard', 'Partners', 'Fraud', 'ESG', 'Users', 'Commission', 'Forecasting', 'Heatmap', 'Marketing', 'Customer Care', 'System'];

function mapPermissionsToFrontend(dbPermissions: any) {
  let perms: string[] = [];
  try {
    perms = typeof dbPermissions === 'string' ? JSON.parse(dbPermissions) : (Array.isArray(dbPermissions) ? dbPermissions : []);
  } catch (e) {
    perms = [];
  }
  
  const isAll = perms.includes('all');
  const result: Record<string, boolean> = {};
  
  MODULES.forEach(m => {
    if (isAll) {
      result[m] = true;
      return;
    }
    const mLower = m.toLowerCase().replace(' ', '-');
    const hasPerm = perms.some(p => {
      const pLower = p.toLowerCase();
      return pLower.startsWith(mLower) || pLower === mLower;
    });
    result[m] = hasPerm;
  });
  
  return result;
}

function mapPermissionsToDb(frontendPermissions: Record<string, boolean>) {
  const keys = Object.keys(frontendPermissions).filter(k => frontendPermissions[k]);
  
  if (keys.length === MODULES.length) {
    return ['all'];
  }
  
  const dbPermissions: string[] = [];
  keys.forEach(k => {
    const keyLower = k.toLowerCase().replace(' ', '-');
    if (keyLower === 'users') {
      dbPermissions.push('users.read', 'users.write');
    } else if (keyLower === 'partners') {
      dbPermissions.push('partners.read', 'partners.write');
    } else if (keyLower === 'system') {
      dbPermissions.push('system.read', 'system.write');
    } else {
      dbPermissions.push(`${keyLower}.read`);
    }
  });
  return dbPermissions;
}

function getRoleUIProps(roleName: string, index: number) {
  const name = roleName.toLowerCase();
  if (name.includes('super admin')) {
    return { accent: 'emerald', color: 'from-emerald-500 to-teal-600' };
  }
  if (name.includes('admin')) {
    return { accent: 'blue', color: 'from-blue-500 to-indigo-600' };
  }
  if (name.includes('moderator') || name.includes('mod')) {
    return { accent: 'purple', color: 'from-purple-500 to-pink-600' };
  }
  const accents = ['orange', 'cyan', 'slate'];
  const gradients = ['from-orange-500 to-red-600', 'from-cyan-500 to-blue-600', 'from-slate-500 to-slate-600'];
  const idx = index % accents.length;
  return { accent: accents[idx], color: gradients[idx] };
}

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // Tự động seed roles nếu bảng trống
    const { count } = await supabase.from('role_permissions').select('*', { count: 'exact', head: true });
    if (count === 0) {
      const defaultRoles = [
        {
          id: 'r1',
          role_name: 'Super Admin',
          description: 'Toàn quyền quản trị hệ thống, hạ tầng và phân quyền nhân sự.',
          permissions: ['all'],
          created_at: new Date().toISOString()
        },
        {
          id: 'r2',
          role_name: 'Store Manager',
          description: 'Quản lý cửa hàng, duyệt đối tác mới và cấu hình tỷ lệ hoa hồng.',
          permissions: ['dashboard.read', 'partners.read', 'partners.write', 'commission.read', 'commission.write', 'users.read'],
          created_at: new Date().toISOString()
        },
        {
          id: 'r3',
          role_name: 'Support Agent',
          description: 'Tiếp nhận phản hồi từ khách hàng và hỗ trợ giải quyết sự cố.',
          permissions: ['dashboard.read', 'customer-care.read', 'customer-care.write'],
          created_at: new Date().toISOString()
        },
        {
          id: 'r4',
          role_name: 'ESG Auditor',
          description: 'Giám sát chỉ số môi trường, dự báo xu hướng lãng phí thực phẩm.',
          permissions: ['dashboard.read', 'esg.read', 'forecasting.read', 'heatmap.read'],
          created_at: new Date().toISOString()
        },
        {
          id: 'r5',
          role_name: 'Marketing Specialist',
          description: 'Quản lý chiến dịch quảng bá, khuyến mãi và gửi thông báo đẩy.',
          permissions: ['dashboard.read', 'marketing.read', 'marketing.write'],
          created_at: new Date().toISOString()
        }
      ];
      await supabase.from('role_permissions').insert(defaultRoles);

      // Thêm assignment cho admin thực tế
      const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const assignments = admins.map(admin => ({
          user_id: admin.id,
          role_id: 'r1'
        }));
        await supabase.from('user_role_assignments').insert(assignments);
      }
    }

    // Truy vấn đồng thời các bảng cần thiết
    const [rolesQuery, assignmentsQuery, usersQuery] = await Promise.all([
      supabase.from('role_permissions').select('*'),
      supabase.from('user_role_assignments').select('*'),
      supabase.from('users').select('role')
    ]);

    if (rolesQuery.error) return handleError(rolesQuery.error);

    const roles = rolesQuery.data || [];
    const assignments = assignmentsQuery.data || [];
    const users = usersQuery.data || [];

    // Tính toán đếm assignments
    const assignmentCounts: Record<string, number> = {};
    assignments.forEach((a: any) => {
      if (a.role_id) {
        assignmentCounts[a.role_id] = (assignmentCounts[a.role_id] || 0) + 1;
      }
    });

    // Fallback đếm từ bảng users
    const userRoleCounts: Record<string, number> = {};
    users.forEach((u: any) => {
      const r = u.role ? u.role.toLowerCase() : 'customer';
      userRoleCounts[r] = (userRoleCounts[r] || 0) + 1;
    });

    const formattedRoles = roles.map((role: any, idx: number) => {
      const uiProps = getRoleUIProps(role.role_name, idx);
      
      // Tính toán count thực tế
      let count = assignmentCounts[role.id] || 0;
      if (count === 0) {
        const nameLower = role.role_name.toLowerCase();
        if (nameLower.includes('super admin') || nameLower.includes('admin')) {
          count = userRoleCounts['admin'] || 0;
        } else if (nameLower.includes('moderator')) {
          count = userRoleCounts['moderator'] || 0;
        }
      }

      return {
        id: role.id,
        name: role.role_name,
        description: role.description || '',
        permissions: mapPermissionsToFrontend(role.permissions),
        count,
        accent: uiProps.accent,
        color: uiProps.color,
        createdAt: role.created_at,
        updatedAt: role.updated_at
      };
    });

    return NextResponse.json(formattedRoles);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = await req.json();
    const dbPermissions = mapPermissionsToDb(body.permissions || {});

    const newRole = {
      id: crypto.randomUUID(),
      role_name: body.name,
      description: body.description || '',
      permissions: JSON.stringify(dbPermissions),
      created_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from('role_permissions')
      .insert(newRole)
      .select()
      .single();

    if (error) return handleError(error);

    const uiProps = getRoleUIProps(result.role_name, 0);

    return NextResponse.json({
      id: result.id,
      name: result.role_name,
      description: result.description,
      permissions: mapPermissionsToFrontend(result.permissions),
      count: 0,
      accent: uiProps.accent,
      color: uiProps.color,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = await req.json();
    const { id, name, description, permissions } = body;

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updates.role_name = name;
    if (description !== undefined) updates.description = description;
    if (permissions !== undefined) updates.permissions = JSON.stringify(mapPermissionsToDb(permissions));

    const { data, error } = await supabase
      .from('role_permissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return handleError(error);

    const uiProps = getRoleUIProps(data.role_name, 0);

    return NextResponse.json({
      id: data.id,
      name: data.role_name,
      description: data.description,
      permissions: mapPermissionsToFrontend(data.permissions),
      count: 0, // Frontend sẽ cập nhật cục bộ hoặc refetch
      accent: uiProps.accent,
      color: uiProps.color,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  } catch (err) {
    return handleError(err);
  }
}

