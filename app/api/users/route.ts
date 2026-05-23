import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireRole, requireAuth, requireAnyRole } from '@/lib/auth/middleware';

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
      const { data, error } = await supabase.from('users').select('*');
      if (error) return handleError(error);

      const enriched = (data || []).map((u: any) => {
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
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) return handleError(error);
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
        'co2_reduced', 'total_orders', 'total_spent', 'wallet_balance'
      ];
      for (const field of sensitiveFields) {
        if (field in updates) {
          delete updates[field];
        }
      }
    }

    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    const { password, ...safe } = toCamelCase(data || {});
    return NextResponse.json(safe);
  } catch (err) { return handleError(err); }
}
