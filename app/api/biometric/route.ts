import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { sendBiometricSuccessEmail } from '@/utils/email/mailer';

// Hàm gửi thông báo hệ thống vào DB cho user
async function sendNotification(userId: string, type: 'deal' | 'order' | 'voucher' | 'system' | 'community' | 'ai', title: string, message: string, icon: string) {
  const supabase = getServerClient();
  if (!supabase) return;
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  await supabase.from('notifications').insert({
    id,
    type,
    title,
    message,
    time: new Date().toISOString(),
    read: false,
    icon,
    user_id: userId
  });
}


// Định nghĩa kiểu dữ liệu cho sinh trắc học
interface BiometricRecord {
  userId: string;
  userName: string;
  status: 'none' | 'pending' | 'verified' | 'rejected';
  image?: string; // Ảnh Face ID base64
  timestamp: number;
  approvedAt?: number;
  
  // Các trường eKYC mở rộng
  documentType?: string;
  frontImage?: string;
  backImage?: string;
  ocrData?: {
    idNumber: string;
    fullName: string;
    dob: string;
    address: string;
    issueDate?: string;
  };
  faceMatchScore?: number;
}

// Khai báo bộ nhớ in-memory toàn cục cho sinh trắc học
const globalBiometric = global as any;
if (!globalBiometric.biometricRecords) {
  globalBiometric.biometricRecords = {};
}

const biometricRecords: Record<string, BiometricRecord> = globalBiometric.biometricRecords;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // 1. Admin lấy toàn bộ danh sách yêu cầu sinh trắc học đang chờ duyệt
    if (action === 'get_all_pending') {
      const pendingRecords = Object.values(biometricRecords).filter(r => r.status === 'pending');
      return NextResponse.json({ success: true, records: pendingRecords });
    }

    // 2. Admin lấy chi tiết sinh trắc học của tất cả users (dưới dạng object map)
    if (action === 'get_all_status') {
      return NextResponse.json({ success: true, records: biometricRecords });
    }

    // 3. Lấy thông tin sinh trắc học của một user cụ thể
    if (userId) {
      const record = biometricRecords[userId] || {
        userId,
        userName: "Người dùng",
        status: 'none',
        timestamp: Date.now()
      };
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  } catch (error) {
    console.error("Biometric GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { userId, userName, image, documentType, frontImage, backImage, ocrData, faceMatchScore } = payload;

    if (!userId || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Cập nhật trạng thái sinh trắc học sang chờ duyệt (pending) và lưu toàn bộ hồ sơ eKYC
    biometricRecords[userId] = {
      userId,
      userName: userName || "Khách hàng F.R.E.S.H",
      status: 'pending',
      image,
      timestamp: Date.now(),
      documentType,
      frontImage,
      backImage,
      ocrData,
      faceMatchScore
    };

    console.log(`[FRESH Biometric] Khách hàng ${userName} (ID: ${userId}) gửi yêu cầu xác minh eKYC thành công.`);

    // Gửi thông báo hệ thống về việc đang chờ duyệt
    await sendNotification(
      userId,
      'system',
      'Yêu cầu xác minh Face ID đã được gửi',
      'Hồ sơ eKYC (Face ID) của bạn đã được gửi thành công và đang chờ Admin phê duyệt.',
      'Fingerprint'
    ).catch(console.error);

    return NextResponse.json({ success: true, record: biometricRecords[userId] });

  } catch (error) {
    console.error("Biometric POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const { userId, status } = payload; // status: 'verified' hoặc 'rejected'

    if (!userId || !status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    if (!biometricRecords[userId]) {
      return NextResponse.json({ error: "Biometric record not found" }, { status: 404 });
    }

    const record = biometricRecords[userId];
    record.status = status;
    record.timestamp = Date.now();
    if (status === 'verified') {
      record.approvedAt = Date.now();
      console.log(`[FRESH Biometric] Admin phê duyệt xác minh sinh trắc học cho User ID: ${userId}`);
      await sendNotification(
        userId,
        'system',
        'Xác minh sinh trắc học thành công',
        'Hồ sơ eKYC (Face ID) của bạn đã được phê duyệt thành công. Tài khoản của bạn đã được xác minh.',
        'ShieldCheck'
      ).catch(console.error);

      // Gửi email thông báo xác minh sinh trắc học thành công
      const supabase = getServerClient();
      if (supabase) {
        const { data: user } = await supabase.from('users').select('email, name').eq('id', userId).single();
        if (user && user.email) {
          sendBiometricSuccessEmail(user.email, user.name || 'Thành viên').catch(err => {
            console.error('Failed to send biometric success email:', err);
          });
        }
      }
    } else {
      console.log(`[FRESH Biometric] Admin từ chối xác minh sinh trắc học cho User ID: ${userId}`);
      await sendNotification(
        userId,
        'system',
        'Xác minh sinh trắc học bị từ chối',
        'Hồ sơ eKYC (Face ID) của bạn đã bị từ chối. Vui lòng tiến hành quét lại.',
        'ShieldAlert'
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, record });

  } catch (error) {
    console.error("Biometric PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
