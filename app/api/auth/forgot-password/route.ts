import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import { sendResetPasswordEmail } from '@/utils/email/mailer';
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
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
    }

    sql = await getDbClient();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. Tự động kiểm tra và nâng cấp cấu trúc bảng users để lưu OTP khôi phục mật khẩu nếu chưa có
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE
    `;

    // 2. Tìm kiếm người dùng bằng email
    const usersList = await sql`
      SELECT id, name, email FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (usersList.length === 0) {
      // Vì lý do bảo mật chống dò quét tài khoản, ta trả về thông báo chung nhưng thành công, 
      // tuy nhiên vì đây là môi trường test và dev, báo lỗi cụ thể để chủ tịch dễ thao tác.
      return NextResponse.json({ error: 'Email này chưa được đăng ký trong hệ thống' }, { status: 404 });
    }

    const user = usersList[0];

    // 3. Tạo mã OTP ngẫu nhiên gồm 8 chữ số
    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Hết hạn sau 15 phút
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 4. Lưu mã OTP vào database
    await sql`
      UPDATE users 
      SET reset_token = ${otp}, reset_token_expires = ${expiresAt}
      WHERE id = ${user.id}
    `;

    // 5. Gửi email chứa mã OTP khôi phục mật khẩu
    const mailRes = await sendResetPasswordEmail(user.email, user.name || 'Thành viên', otp);

    if (!mailRes.success) {
      console.error('Failed to send reset password email:', mailRes.error);
      return NextResponse.json({ error: 'Không thể gửi email mã OTP, vui lòng kiểm tra lại cấu hình Resend' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.' 
    });

  } catch (err: any) {
    console.error('Forgot password API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}
