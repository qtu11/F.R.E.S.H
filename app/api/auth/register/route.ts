import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/supabase/transform';
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/utils/email/mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, name, role = 'customer', phone, address } = body;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (role !== 'customer') {
      return NextResponse.json({ error: 'Chỉ được phép đăng ký tài khoản khách hàng (customer) qua luồng này. Đối tác vui lòng sử dụng luồng đăng ký đối tác riêng biệt.' }, { status: 400 });
    }

    const supabase = getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // 1. Kiểm tra xem email đã tồn tại trong public.users chưa
    const { data: existingUser, error: existError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existError) {
      console.error('Check existing user error:', existError);
    }

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // 2. Tạo tài khoản trên Supabase Auth Dashboard
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Tự động xác nhận email để chủ tịch test được ngay
      user_metadata: { name, role }
    });

    if (authError) {
      console.error('Supabase Auth registration error:', authError);
      return NextResponse.json({ error: authError.message || 'Failed to create auth account' }, { status: 400 });
    }

    const userId = authData.user.id; // Lấy UUID sinh ra từ Supabase Auth
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const newUser = {
      id: userId, // Đồng bộ ID UUID
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
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

    // 3. Insert/Upsert thông tin chi tiết vào bảng public.users
    const { data, error: dbError } = await supabase
      .from('users')
      .upsert(newUser, { onConflict: 'id' })
      .select()
      .single();

    if (dbError) {
      console.error('Register database insert error:', dbError);
      // Rollback: Nếu chèn DB lỗi, xóa user trên Auth Dashboard để tránh lệch dữ liệu
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create database profile' }, { status: 500 });
    }

    const { password: _, ...user } = toCamelCase(data);
    const token = signToken(data.id, data.role);

    // Gửi email chào mừng phi đồng bộ (không block luồng đăng ký nếu Resend chậm)
    sendWelcomeEmail(email.toLowerCase(), name).catch(err => {
      console.error('Welcome email sending failed:', err);
    });

    const response = NextResponse.json({ user, token });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

