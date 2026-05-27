import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import { logSecurityEvent } from '@/lib/auth/security';

export async function POST(req: Request) {
  const startTime = Date.now();
  let userIdForLog: string | null = null;
  
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      await logSecurityEvent(req, null, '/api/auth/login', 'POST', 400, Date.now() - startTime);
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = getServerClient();
    if (!supabase) {
      await logSecurityEvent(req, null, '/api/auth/login', 'POST', 503, Date.now() - startTime);
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // 1. Kiểm tra cấu hình Admin từ file .env
    const adminLogin = process.env.ADMIN_LOGIN;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const isEnvAdmin = !!(adminLogin && adminPassword && email.toLowerCase() === adminLogin.toLowerCase());

    let dbUser = null;

    if (isEnvAdmin && adminPassword) {
      // Kiểm tra mật khẩu khớp với .env
      if (password !== adminPassword) {
        await logSecurityEvent(req, null, '/api/auth/login', 'POST', 401, Date.now() - startTime);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Truy vấn DB xem user admin này tồn tại chưa
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      if (error || !data) {
        // Tự động tạo tài khoản admin nếu chưa tồn tại
        const { data: newData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: 'u-admin-fresh4',
            email: email.toLowerCase(),
            password: hashedPassword,
            name: 'Fresh Admin 4',
            role: 'admin',
            avatar: 'FA',
            status: 'active',
            join_date: new Date().toISOString().split('T')[0],
            last_active: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (insertError) {
          console.error("Auto-create admin error:", insertError);
          // Fallback dùng mock object nếu insert lỗi để không chặn luồng của admin
          dbUser = {
            id: 'u-admin-fresh4',
            email: email.toLowerCase(),
            name: 'Fresh Admin 4',
            role: 'admin',
            avatar: 'FA',
            status: 'active'
          };
        } else {
          dbUser = newData;
        }
      } else {
        // Nếu user đã tồn tại, kiểm tra và cập nhật mật khẩu băm, role và status
        let passwordOk = false;
        if (data.password.startsWith('$2')) {
          passwordOk = await bcrypt.compare(adminPassword, data.password);
        } else {
          passwordOk = (adminPassword === data.password);
        }
        if (!passwordOk || data.role !== 'admin' || data.status !== 'active') {
          const { data: updatedData, error: updateError } = await supabase
            .from('users')
            .update({
              password: hashedPassword,
              role: 'admin',
              status: 'active'
            })
            .eq('email', email.toLowerCase())
            .select()
            .single();

          if (updateError) {
            console.error("Auto-update admin credentials error:", updateError);
            dbUser = data; // Dùng dữ liệu hiện tại làm fallback
          } else {
            dbUser = updatedData;
          }
        } else {
          dbUser = data;
        }
      }
    } else {
      // Luồng đăng nhập thông thường dành cho người dùng khác
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        await logSecurityEvent(req, null, '/api/auth/login', 'POST', 401, Date.now() - startTime);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Kiểm tra mật khẩu: hỗ trợ cả bcrypt hash và plaintext (cho dữ liệu seed cũ)
      let isPasswordValid = false;
      const isBcryptHash = typeof data.password === 'string' && data.password.startsWith('$2');

      if (isBcryptHash) {
        isPasswordValid = await bcrypt.compare(password, data.password);
      } else {
        // Fallback cho plaintext password (seed cũ)
        isPasswordValid = (password === data.password);
        if (isPasswordValid) {
          // Nâng cấp lên bcrypt hash
          const hashedPassword = await bcrypt.hash(password, 10);
          await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', data.id);
        }
      }

      if (!isPasswordValid) {
        await logSecurityEvent(req, null, '/api/auth/login', 'POST', 401, Date.now() - startTime);
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      dbUser = data;
    }

    userIdForLog = dbUser.id;

    if (dbUser.status === 'banned') {
      await logSecurityEvent(req, userIdForLog, '/api/auth/login', 'POST', 403, Date.now() - startTime);
      return NextResponse.json({ error: 'Your account has been banned' }, { status: 403 });
    }

    if (dbUser.status === 'suspended') {
      await logSecurityEvent(req, userIdForLog, '/api/auth/login', 'POST', 403, Date.now() - startTime);
      return NextResponse.json({ error: 'Your account has been suspended' }, { status: 403 });
    }

    const { password: _, ...user } = toCamelCase(dbUser);

    if (user.role === 'partner') {
      const { data: branch } = await supabase
        .from('organization_branches')
        .select('store_id')
        .eq('organization_id', user.organizationId)
        .maybeSingle();
      if (branch) {
        user.storeId = branch.store_id;
      } else {
        user.storeId = null;
      }
    }

    const token = signToken(dbUser.id, dbUser.role);
    const response = NextResponse.json({ user, token });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    await logSecurityEvent(req, userIdForLog, '/api/auth/login', 'POST', 200, Date.now() - startTime);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    await logSecurityEvent(req, userIdForLog, '/api/auth/login', 'POST', 500, Date.now() - startTime);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
