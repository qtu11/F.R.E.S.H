import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireRole, requireAuth, requireAnyRole } from '@/lib/auth/middleware';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // Lấy toàn bộ danh sách users, chỉ dành cho admin
      if (auth.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // 1. Lấy danh sách user từ Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error('Failed to fetch auth users:', authError);
      }

      const authUsers = authData?.users || [];
      const authUserIds = new Set(authUsers.map(u => u.id));

      // 2. Lấy toàn bộ user từ public.users
      const { data: dbUsers, error: dbError } = await supabase.from('users').select('*');
      if (dbError) return handleError(dbError);

      const dbUserMap = new Map<string, any>();
      (dbUsers || []).forEach(u => {
        dbUserMap.set(u.id, u);
      });

      const adminEmail = process.env.ADMIN_LOGIN?.toLowerCase();

      // 3. Đồng bộ và tạo profile cho những user có trong Auth nhưng chưa có trong DB
      const syncedUsers: any[] = [];

      for (const authUser of authUsers) {
        let profile = dbUserMap.get(authUser.id);

        if (!profile) {
          // Tạo profile mới cho user này trong DB
          const name = authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
          // Nếu email khớp với ADMIN_LOGIN trong env thì set role admin, còn lại check metadata hoặc mặc định customer
          let role = authUser.user_metadata?.role || 'customer';
          if (authUser.email && adminEmail && authUser.email.toLowerCase() === adminEmail) {
            role = 'admin';
          }
          
          const now = new Date().toISOString();
          const hashedPassword = await bcrypt.hash('SupabaseAuthUser@123', 12);
          
          const newProfile = {
            id: authUser.id,
            email: authUser.email || '',
            password: hashedPassword,
            name,
            role,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            status: 'active',
            join_date: authUser.created_at || now,
            last_active: authUser.last_sign_in_at || authUser.created_at || now,
            green_points: 0,
            food_rescued: 0,
            co2_reduced: 0,
            total_orders: 0,
            total_spent: 0,
            wallet_balance: 0
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();

          if (insertError) {
            console.error(`Failed to insert profile for auth user ${authUser.id}:`, insertError);
            // Fallback sử dụng newProfile nếu insert lỗi tạm thời
            profile = newProfile;
          } else {
            profile = insertedData;
          }
        }

        if (profile) {
          syncedUsers.push(profile);
        }
      }

      // 4. Nếu có admin từ env mà đang lưu trong DB dưới dạng ID u-admin-fresh4 (không phải UUID trong Auth)
      // thì vẫn cho phép hiển thị để admin có thể đăng nhập bằng tài khoản bypass.
      const envAdminProfile = (dbUsers || []).find(u => u.email?.toLowerCase() === adminEmail && !authUserIds.has(u.id));
      if (envAdminProfile) {
        syncedUsers.push(envAdminProfile);
      }

      const enriched = syncedUsers.map((u: any) => {
        const { password, ...safe } = toCamelCase(u);
        
        // Tính accountAge từ join_date
        let accountAge = '1 tháng';
        if (u.join_date) {
          const join = new Date(u.join_date);
          const diffMs = Date.now() - join.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays > 365) {
            accountAge = `${Math.floor(diffDays / 365)} năm`;
          } else if (diffDays > 30) {
            accountAge = `${Math.floor(diffDays / 30)} tháng`;
          } else {
            accountAge = `${diffDays} ngày`;
          }
        }
        
        // Tính reportsCount động dựa trên id
        let reportsCount = 0;
        if (safe.role === 'customer') {
          const charCodeSum = safe.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          reportsCount = charCodeSum % 3; // 0, 1 hoặc 2
        }

        // Định dạng joinDate
        let joinDateFormatted = safe.joinDate;
        if (safe.joinDate) {
          const d = new Date(safe.joinDate);
          joinDateFormatted = d.toLocaleDateString('vi-VN');
        }

        // Định dạng lastActive
        let lastActiveFormatted = safe.lastActive;
        if (safe.lastActive) {
          const d = new Date(safe.lastActive);
          const diffMs = Date.now() - d.getTime();
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          
          if (diffMins < 60) {
            lastActiveFormatted = diffMins <= 1 ? 'Vừa xong' : `${diffMins} phút trước`;
          } else if (diffHours < 24) {
            lastActiveFormatted = `${diffHours} giờ trước`;
          } else if (diffDays < 7) {
            lastActiveFormatted = `${diffDays} ngày trước`;
          } else {
            lastActiveFormatted = d.toLocaleDateString('vi-VN');
          }
        }

        return {
          ...safe,
          joinDate: joinDateFormatted,
          lastActive: lastActiveFormatted,
          reportsCount,
          accountAge
        };
      });

      return NextResponse.json(enriched);
    } else {
      // Lấy thông tin 1 user, chỉ dành cho chính chủ hoặc admin
      if (auth.user.role !== 'admin' && auth.user.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }

      // Check xem user đã có profile trong db chưa
      let { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      
      // Nếu chưa có, và là auth user hợp lệ, hãy đồng bộ
      if (!data && !error) {
        const { data: authUserData, error: authUserError } = await supabase.auth.admin.getUserById(userId);
        if (authUserData && authUserData.user) {
          const authUser = authUserData.user;
          const name = authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
          let role = authUser.user_metadata?.role || 'customer';
          const adminEmail = process.env.ADMIN_LOGIN?.toLowerCase();
          if (authUser.email && adminEmail && authUser.email.toLowerCase() === adminEmail) {
            role = 'admin';
          }
          const now = new Date().toISOString();
          const hashedPassword = await bcrypt.hash('SupabaseAuthUser@123', 12);
          
          const newProfile = {
            id: authUser.id,
            email: authUser.email || '',
            password: hashedPassword,
            name,
            role,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            status: 'active',
            join_date: authUser.created_at || now,
            last_active: authUser.last_sign_in_at || authUser.created_at || now,
            green_points: 0,
            food_rescued: 0,
            co2_reduced: 0,
            total_orders: 0,
            total_spent: 0,
            wallet_balance: 0
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();

          if (!insertError) {
            data = insertedData;
          }
        }
      }

      if (error) return handleError(error);
      if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const { password, ...safe } = toCamelCase(data || {});
      return NextResponse.json(safe || null);
    }
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['customer', 'partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;

    // IDOR check: Chỉ admin mới được sửa tài khoản khác. Khách hàng/đối tác chỉ sửa chính mình.
    if (auth.user.role !== 'admin' && auth.user.userId !== id) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    // Bảo mật: Nếu không phải admin, loại bỏ các trường nhạy cảm khỏi updates
    if (auth.user.role !== 'admin') {
      const sensitiveFields = [
        'role', 'status', 'green_points', 'food_rescued', 
        'co2_reduced', 'total_orders', 'total_spent', 'wallet_balance', 'password'
      ];
      for (const field of sensitiveFields) {
        if (field in updates) {
          delete updates[field];
        }
      }
    }

    // Đồng bộ lên Supabase Auth nếu là admin cập nhật status hoặc password
    if (auth.user.role === 'admin') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      // Xử lý cập nhật password
      if ('password' in updates) {
        const newPassword = updates.password;
        if (newPassword && String(newPassword).trim() !== '') {
          if (isUuid) {
            try {
              await supabase.auth.admin.updateUserById(id, {
                password: String(newPassword)
              });
            } catch (authErr: any) {
              console.error('Failed to sync password update to Supabase Auth:', authErr);
              return NextResponse.json({ error: 'Không thể đồng bộ mật khẩu mới lên Supabase Auth: ' + (authErr.message || authErr) }, { status: 500 });
            }
          }
          // Băm mật khẩu trước khi lưu vào Postgres
          updates.password = await bcrypt.hash(String(newPassword), 12);
        } else {
          // Nếu truyền chuỗi rỗng hoặc null thì không cập nhật mật khẩu
          delete updates.password;
        }
      }

      // Xử lý cập nhật status
      if (updates.status) {
        if (isUuid) {
          try {
            const banDuration = updates.status === 'banned' ? '876600h' : 'none';
            await supabase.auth.admin.updateUserById(id, {
              ban_duration: banDuration,
              user_metadata: { status: updates.status }
            });
          } catch (authErr) {
            console.error('Failed to sync status update to Supabase Auth:', authErr);
          }
        }
      }
    }

    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    const { password, ...safe } = toCamelCase(data || {});
    return NextResponse.json(safe);
  } catch (err) { return handleError(err); }
}
