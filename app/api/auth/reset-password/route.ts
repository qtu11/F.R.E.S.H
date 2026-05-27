import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

async function getDbClient() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) return null;
  return postgres(connStr, { max: 1 });
}

export async function POST(req: Request) {
  let sql: postgres.Sql | null = null;
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, mã OTP và mật khẩu mới là bắt buộc' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có tối thiểu 6 ký tự' }, { status: 400 });
    }

    sql = await getDbClient();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. Tìm thông tin OTP của user
    const usersList = await sql`
      SELECT id, reset_token, reset_token_expires FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    if (usersList.length === 0) {
      return NextResponse.json({ error: 'Email này chưa được đăng ký trong hệ thống' }, { status: 404 });
    }

    const user = usersList[0];

    // 2. Xác thực OTP
    if (!user.reset_token || user.reset_token !== otp) {
      return NextResponse.json({ error: 'Mã OTP không chính xác' }, { status: 400 });
    }

    // Kiểm tra thời hạn OTP
    const expires = user.reset_token_expires ? new Date(user.reset_token_expires) : null;
    if (!expires || expires < new Date()) {
      return NextResponse.json({ error: 'Mã OTP đã hết hiệu lực khôi phục (quá 15 phút)' }, { status: 400 });
    }

    // 3. Đồng bộ mật khẩu mới lên Supabase Auth Dashboard
    const supabase = getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client failed' }, { status: 500 });
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (authError) {
      console.error('Supabase Auth password update error:', authError);
      return NextResponse.json({ error: `Đồng bộ mật khẩu Auth thất bại: ${authError.message}` }, { status: 500 });
    }

    // 4. Mã hóa mật khẩu cho DB local và lưu mật khẩu mới, đồng thời dọn dẹp mã OTP đã dùng
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, 
          reset_token = NULL, 
          reset_token_expires = NULL 
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Đặt lại mật khẩu mới thành công! Bạn có thể sử dụng mật khẩu này để đăng nhập ngay.' 
    });

  } catch (err: any) {
    console.error('Reset password API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}
