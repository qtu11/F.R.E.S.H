import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import { sendVerificationReminderEmail } from '@/utils/email/mailer';
import postgres from 'postgres';

// Khởi tạo DB Client kết nối trực tiếp PostgreSQL
async function getDbClient() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) return null;
  return postgres(connStr, { max: 1 });
}

// Truy cập biometricRecords in-memory từ file app/api/biometric/route.ts
function getBiometricStatusMap() {
  const globalBiometric = global as any;
  return globalBiometric.biometricRecords || {};
}

export async function GET(req: Request) {
  let sql: postgres.Sql | null = null;
  try {
    // 1. Kết nối cơ sở dữ liệu trực tiếp để thêm cột và truy vấn nâng cao
    sql = await getDbClient();
    if (!sql) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Tự động kiểm tra và thêm cột lưu mốc thời gian gửi email nhắc nhở cuối cùng
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_verification_email_sent TIMESTAMP WITH TIME ZONE
    `;

    // 2. Lấy thông tin sinh trắc học in-memory hiện tại
    const biometricMap = getBiometricStatusMap();

    // 3. Lấy danh sách toàn bộ người dùng có email và vai trò là khách hàng hoặc đối tác
    const users = await sql`
      SELECT id, email, name, last_verification_email_sent 
      FROM users 
      WHERE email IS NOT NULL AND role IN ('customer', 'partner')
    `;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let sentCount = 0;
    const sentToUsers = [];

    // 4. Lọc và gửi email nhắc nhở
    for (const user of users) {
      const bioRecord = biometricMap[user.id];
      const bioStatus = bioRecord ? bioRecord.status : 'none';

      // Chỉ gửi email nhắc nhở nếu chưa xác minh sinh trắc học thành công (status !== 'verified')
      if (bioStatus !== 'verified') {
        const lastSent = user.last_verification_email_sent 
          ? new Date(user.last_verification_email_sent) 
          : null;

        // Gửi email nếu chưa từng gửi hoặc đã gửi cách đây hơn 7 ngày
        if (!lastSent || lastSent <= oneWeekAgo) {
          const verificationUrl = 'http://localhost:3001/customer/profile';
          
          // Gửi email nhắc nhở xác minh
          const emailResult = await sendVerificationReminderEmail(
            user.email,
            user.name || 'Thành viên F.R.E.S.H',
            verificationUrl
          );

          if (emailResult.success) {
            sentCount++;
            sentToUsers.push({ id: user.id, email: user.email, name: user.name });

            // Cập nhật mốc thời gian gửi thư mới nhất trong database
            await sql`
              UPDATE users 
              SET last_verification_email_sent = CURRENT_TIMESTAMP 
              WHERE id = ${user.id}
            `;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Quá trình quét và nhắc nhở hoàn tất. Đã gửi ${sentCount} email.`,
      sentCount,
      recipients: sentToUsers
    });

  } catch (err: any) {
    console.error('Cron reminder error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}
