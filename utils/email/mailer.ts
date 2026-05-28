const RESEND_API_KEY = 're_D3XRMD2j_EeNXg4GFDWmbdnH2ec2Z7nw7';
const FROM_EMAIL = 'F.R.E.S.H Platform <onboarding@resend.dev>';

// Hàm gửi email cốt lõi qua REST API của Resend
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: html
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data };
    }
    return { success: true, messageId: data.id };
  } catch (err) {
    console.error('Failed to send email via Resend:', err);
    return { success: false, error: err };
  }
}

// Layout Email HTML tiêu chuẩn Enterprise hỗ trợ cấu trúc Song ngữ tinh tế
function getEmailLayout(viContent: string, enContent: string, previewText: string = '') {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>F.R.E.S.H Platform</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #057A42, #046034); padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px; }
          .header p { color: #a3e635; margin: 5px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .content { padding: 35px 25px; color: #333333; line-height: 1.6; }
          .lang-section { padding-bottom: 25px; }
          .lang-en { border-top: 1px dashed #e2e8f0; padding-top: 25px; margin-top: 25px; color: #4a5568; }
          .lang-en h2 { color: #4a5568 !important; }
          .content h2 { color: #057A42; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px; }
          .content p { font-size: 14px; margin-top: 0; margin-bottom: 12px; }
          .button { display: inline-block; padding: 12px 28px; background-color: #057A42; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; margin: 15px 0; text-align: center; transition: background-color 0.2s; }
          .button:hover { background-color: #046034; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7; color: #718096; font-size: 11px; }
          .footer a { color: #057A42; text-decoration: none; font-weight: bold; }
          .badge { display: inline-block; padding: 4px 8px; background-color: #e6f4ea; color: #137333; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .table th { background-color: #f8fafc; border-bottom: 2px solid #edf2f7; text-align: left; padding: 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #718096; }
          .table td { border-bottom: 1px solid #edf2f7; padding: 10px; font-size: 12px; color: #4a5568; }
          .highlight-box { background-color: #f7fee7; border: 1px solid #d9f99d; padding: 15px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #84cc16; font-size: 13px; }
          .alert-box { background-color: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #ef4444; font-size: 13px; }
        </style>
      </head>
      <body>
        <span style="display:none !important; font-size:1px; color:#fff; line-height:1px;">${previewText}</span>
        <div class="container">
          <div class="header">
            <h1>F.R.E.S.H.</h1>
            <p>AI & ESG Food Rescue Ecosystem</p>
          </div>
          <div class="content">
            <!-- Tiếng Việt -->
            <div class="lang-section lang-vi">
              ${viContent}
            </div>
            
            <!-- English -->
            <div class="lang-section lang-en">
              ${enContent}
            </div>
          </div>
          <div class="footer">
            <p>© 2026 F.R.E.S.H Platform. All rights reserved.</p>
            <p>Hệ thống tự động vận hành bởi UEF Startup & AI Lab.</p>
            <p><a href="https://fresh.uef.edu.vn">Website Platform</a> | <a href="https://fresh.uef.edu.vn/support">Support 24/7</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// 1. Phản hồi khi đăng ký tài khoản (Welcome Email)
export async function sendWelcomeEmail(to: string, name: string) {
  const viContent = `
    <h2>Chào mừng ${name} đến với F.R.E.S.H!</h2>
    <p>Cảm ơn bạn đã tham gia vào hệ sinh thái cứu hộ thực phẩm thông minh hyperlocal và bù đắp tín chỉ carbon ESG của chúng tôi.</p>
    <p>Với tài khoản F.R.E.S.H, bạn có thể mua các gói thực phẩm giải cứu ngon lành với giá giảm sâu bằng thuật toán <strong>AI Dynamic Pricing</strong>, tích lũy <strong>Tín chỉ Điểm Xanh</strong> từ các hành động bền vững, và theo dõi lượng phát thải <strong>CO₂ giảm thiểu</strong> từ mỗi bữa ăn cứu hộ.</p>
    <p>Hãy nhấp vào nút bên dưới để đăng nhập vào hệ sinh thái:</p>
    <div style="text-align: center;">
      <a href="http://localhost:3001" class="button">Vào hệ sinh thái ngay</a>
    </div>
    <p>Hãy cùng nhau kiến tạo tương lai không rác thải thực phẩm!</p>
  `;

  const enContent = `
    <h2>Welcome ${name} to F.R.E.S.H!</h2>
    <p>Thank you for joining our intelligent hyperlocal food rescue and ESG carbon offset ecosystem.</p>
    <p>With your F.R.E.S.H account, you can buy delicious surplus food packages at deep discounts powered by <strong>AI Dynamic Pricing</strong>, earn <strong>Green Credits</strong> for sustainable actions, and track the <strong>CO₂ emissions reduced</strong> from every rescue meal.</p>
    <p>Click the button below to sign in to the ecosystem:</p>
    <div style="text-align: center;">
      <a href="http://localhost:3001" class="button">Enter Ecosystem Now</a>
    </div>
    <p>Let's build a zero-food-waste future together!</p>
  `;

  return sendEmail({
    to,
    subject: '🌱 Chào mừng bạn đến với Hệ sinh thái F.R.E.S.H! / Welcome to F.R.E.S.H Ecosystem!',
    html: getEmailLayout(viContent, enContent, 'Chào mừng bạn tham gia mạng lưới cứu thực phẩm thông minh.')
  });
}

// 2. Yêu cầu xác minh tài khoản (Gửi nhắc nhở chưa xác minh sinh trắc học)
export async function sendVerificationReminderEmail(to: string, name: string, verificationUrl: string) {
  const viContent = `
    <h2>Yêu cầu xác minh sinh trắc học (KYC)</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Hệ thống F.R.E.S.H ghi nhận tài khoản của bạn hiện <strong>chưa thực hiện xác minh sinh trắc học eKYC (Face ID)</strong>.</p>
    <div class="alert-box">
      <strong>⚠️ LƯU Ý BẢO MẬT:</strong> Để bảo vệ số dư ví điện tử F.R.E.S.H Pay chống lại các hành vi gian lận và thực hiện các giao dịch nạp rút có hạn mức lớn hơn, bạn cần hoàn tất xác minh sinh trắc học ngay.
    </div>
    <p>Vui lòng nhấp vào liên kết dưới đây để truy cập trang Hồ sơ và thực hiện quét sinh trắc học Face ID trực tiếp trên điện thoại của bạn:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Xác minh tài khoản ngay</a>
    </div>
  `;

  const enContent = `
    <h2>Biometric Verification Required (KYC)</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>F.R.E.S.H system records show that your account has <strong>not completed Biometric eKYC (Face ID) Verification</strong>.</p>
    <div class="alert-box" style="border-left-color: #ef4444; background-color: #fef2f2; border-color: #fca5a5; color: #991b1b;">
      <strong>⚠️ SECURITY NOTE:</strong> To protect your F.R.E.S.H Pay balance against fraudulent activities and enable higher deposit/withdrawal transaction limits, you must complete biometric verification.
    </div>
    <p>Please click the link below to access your Profile page and perform a Face ID biometric scan directly on your phone:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Account Now</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: '🔒 [Bảo Mật / Security] Yêu cầu xác minh sinh trắc học / Biometric Verification Required',
    html: getEmailLayout(viContent, enContent, 'Vui lòng hoàn tất quét sinh trắc học để bảo vệ số dư ví của bạn.')
  });
}

// 3. Email thông báo Nạp tiền thành công
export async function sendDepositSuccessEmail(to: string, name: string, amount: number, txId: string, balance: number) {
  const viContent = `
    <h2>Nạp tiền ví F.R.E.S.H Pay thành công!</h2>
    <p>Xin chào <strong>${name}</strong>, giao dịch nạp tiền của bạn đã được đối soát tự động thành công.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Mã Giao Dịch</th>
          <th>Số Tiền Nạp</th>
          <th>Phương Thức</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${txId}</td>
          <td style="color: #057A42; font-weight: bold;">+${amount.toLocaleString()}đ</td>
          <td>Chuyển khoản Ngân hàng</td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box">
      Số dư khả dụng hiện tại trong ví F.R.E.S.H Pay của bạn là: <strong>${balance.toLocaleString()}đ</strong>
    </div>
  `;

  const enContent = `
    <h2>Deposit to F.R.E.S.H Pay Successful!</h2>
    <p>Hello <strong>${name}</strong>, your deposit transaction has been automatically reconciled successfully.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Amount Deposited</th>
          <th>Method</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${txId}</td>
          <td style="color: #057A42; font-weight: bold;">+${amount.toLocaleString()} VND</td>
          <td>Bank Transfer</td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box" style="border-left-color: #84cc16; background-color: #f7fee7; border-color: #d9f99d; color: #3f6212;">
      Current available balance in your F.R.E.S.H Pay wallet is: <strong>${balance.toLocaleString()} VND</strong>
    </div>
  `;

  return sendEmail({
    to,
    subject: `💳 [F.R.E.S.H Pay] Biến động số dư / Balance Update: +${amount.toLocaleString()}đ`,
    html: getEmailLayout(viContent, enContent, `Giao dịch nạp tiền mã ${txId} đã hoàn tất. Số dư mới: ${balance.toLocaleString()}đ.`)
  });
}

// 4. Email thông báo Rút tiền thành công
export async function sendWithdrawalSuccessEmail(to: string, name: string, amount: number, txId: string, balance: number) {
  const viContent = `
    <h2>Rút tiền ví F.R.E.S.H Pay thành công!</h2>
    <p>Xin chào <strong>${name}</strong>, yêu cầu rút tiền về tài khoản ngân hàng liên kết của bạn đã được phê duyệt và giải ngân thành công.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Mã Giao Dịch</th>
          <th>Số Tiền Rút</th>
          <th>Trạng Thái</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${txId}</td>
          <td style="color: #dc2626; font-weight: bold;">-${amount.toLocaleString()}đ</td>
          <td><span class="badge">Đã giải ngân</span></td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box">
      Số dư còn lại trong ví F.R.E.S.H Pay của bạn là: <strong>${balance.toLocaleString()}đ</strong>
    </div>
  `;

  const enContent = `
    <h2>Withdrawal from F.R.E.S.H Pay Successful!</h2>
    <p>Hello <strong>${name}</strong>, your withdrawal request to your linked bank account has been approved and disbursed successfully.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Amount Withdrawn</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${txId}</td>
          <td style="color: #dc2626; font-weight: bold;">-${amount.toLocaleString()} VND</td>
          <td><span class="badge" style="background-color: #e0f2fe; color: #0369a1;">DISBURSED</span></td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box" style="border-left-color: #84cc16; background-color: #f7fee7; border-color: #d9f99d; color: #3f6212;">
      Remaining balance in your F.R.E.S.H Pay wallet is: <strong>${balance.toLocaleString()} VND</strong>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🏦 [F.R.E.S.H Pay] Giải ngân thành công / Disbursement Successful: -${amount.toLocaleString()}đ`,
    html: getEmailLayout(viContent, enContent, `Yêu cầu rút tiền mã ${txId} đã giải ngân thành công.`)
  });
}

// 5. Email thông báo Mua sản phẩm (Hóa đơn điện tử)
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export async function sendOrderConfirmationEmail(
  to: string, 
  name: string, 
  orderId: string, 
  items: OrderItem[], 
  total: number, 
  co2Saved: number, 
  pointsEarned: number
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right; font-weight: bold;">${(item.price * item.quantity).toLocaleString()}đ</td>
    </tr>
  `).join('');

  const viContent = `
    <h2>Biên lai thanh toán đơn hàng giải cứu F.R.E.S.H</h2>
    <p>Cảm ơn bạn <strong>${name}</strong> đã đặt mua thực phẩm cận hạn và chung tay giảm lượng rác thải hữu cơ đô thị!</p>
    <p>Đơn hàng mã <strong>#${orderId}</strong> của bạn đã được xác nhận thanh toán qua ví F.R.E.S.H Pay.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Tên Sản Phẩm</th>
          <th style="text-align: center; width: 60px;">SL</th>
          <th style="text-align: right; width: 120px;">Thành Tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="font-weight: bold; background-color: #f8fafc;">
          <td colspan="2" style="text-align: right; border-top: 2px solid #edf2f7;">TỔNG CỘNG:</td>
          <td style="text-align: right; color: #057A42; font-size: 14px; border-top: 2px solid #edf2f7;">${total.toLocaleString()}đ</td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box">
      <h3 style="margin-top: 0; color: #4d7c0f; font-size: 13px; font-weight: bold;">🌱 Tác động ESG của bạn từ đơn hàng này:</h3>
      <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px; color: #3f6212;">
        <li>Giảm thiểu phát thải Carbon: <strong>-${co2Saved.toFixed(2)} kg CO₂ equivalents</strong></li>
        <li>Tích lũy Điểm thưởng Xanh: <strong>+${pointsEarned} Points</strong></li>
      </ul>
    </div>
  `;

  const enContent = `
    <h2>F.R.E.S.H Food Rescue Payment Receipt</h2>
    <p>Thank you <strong>${name}</strong> for ordering surplus food and helping reduce urban organic waste!</p>
    <p>Your order <strong>#${orderId}</strong> has been successfully paid via F.R.E.S.H Pay wallet.</p>
    
    <table class="table">
      <thead>
        <tr>
          <th>Product Name</th>
          <th style="text-align: center; width: 60px;">QTY</th>
          <th style="text-align: right; width: 120px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml.replace(/đ/g, ' VND')}
        <tr style="font-weight: bold; background-color: #f8fafc;">
          <td colspan="2" style="text-align: right; border-top: 2px solid #edf2f7;">TOTAL AMOUNT:</td>
          <td style="text-align: right; color: #057A42; font-size: 14px; border-top: 2px solid #edf2f7;">${total.toLocaleString()} VND</td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box" style="border-left-color: #84cc16; background-color: #f7fee7; border-color: #d9f99d; color: #3f6212;">
      <h3 style="margin-top: 0; color: #4d7c0f; font-size: 13px; font-weight: bold;">🌱 Your ESG Impact from this order:</h3>
      <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 12px; color: #3f6212;">
        <li>Carbon Emissions Reduced: <strong>-${co2Saved.toFixed(2)} kg CO₂ equivalents</strong></li>
        <li>Green Reward Points Accumulated: <strong>+${pointsEarned} Points</strong></li>
      </ul>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🛒 [F.R.E.S.H] Hóa đơn điện tử đơn hàng / E-Receipt Order #${orderId}`,
    html: getEmailLayout(viContent, enContent, `Đơn hàng #${orderId} trị giá ${total.toLocaleString()}đ đã thanh toán thành công.`)
  });
}

// 6. Email thông báo đặt lại mật khẩu (Reset Password OTP)
export async function sendResetPasswordEmail(to: string, name: string, resetCode: string) {
  const viContent = `
    <h2>Yêu cầu khôi phục mật khẩu tài khoản</h2>
    <p>Xin chào <strong>${name}</strong>, hệ thống F.R.E.S.H ghi nhận một yêu cầu đặt lại mật khẩu từ địa chỉ email của bạn.</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #718096; margin-bottom: 8px; letter-spacing: 1px;">Mã xác thực OTP của bạn</p>
      <div style="display: inline-block; padding: 15px 35px; background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; font-family: monospace; font-size: 28px; font-weight: 800; color: #166534; letter-spacing: 6px;">
        ${resetCode}
      </div>
      <p style="font-size: 11px; color: #a0aec0; margin-top: 10px;">Hiệu lực trong vòng 15 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
    </div>

    <div class="alert-box">
      <strong>⚠️ CẢNH BÁO AN NINH:</strong> Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu ngay lập tức hoặc liên hệ Admin để bảo vệ tài khoản.
    </div>
  `;

  const enContent = `
    <h2>Account Password Recovery Request</h2>
    <p>Hello <strong>${name}</strong>, F.R.E.S.H system received a password reset request from your email address.</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #718096; margin-bottom: 8px; letter-spacing: 1px;">Your OTP Verification Code</p>
      <div style="display: inline-block; padding: 15px 35px; background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; font-family: monospace; font-size: 28px; font-weight: 800; color: #166534; letter-spacing: 6px;">
        ${resetCode}
      </div>
      <p style="font-size: 11px; color: #a0aec0; margin-top: 10px;">Valid for 15 minutes. Absolutely do not share this code with anyone.</p>
    </div>

    <div class="alert-box" style="border-left-color: #ef4444; background-color: #fef2f2; border-color: #fca5a5; color: #991b1b;">
      <strong>⚠️ SECURITY WARNING:</strong> If you did not make this request, please change your password immediately or contact Admin to secure your account.
    </div>
  `;

  return sendEmail({
    to,
    subject: '🔑 [Bảo Mật / Security] Mã xác thực đặt lại mật khẩu / Password Reset OTP Code',
    html: getEmailLayout(viContent, enContent, 'Sử dụng mã OTP này để khôi phục mật khẩu truy cập của bạn.')
  });
}

// 7. Email thông báo xác minh sinh trắc học thành công (eKYC Verified Success) [NEW]
export async function sendBiometricSuccessEmail(to: string, name: string) {
  const viContent = `
    <h2>Xác minh sinh trắc học thành công!</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <div class="highlight-box">
      <strong>🎉 CHÚC MỪNG:</strong> Hồ sơ eKYC (Face ID) của bạn đã được Phòng an ninh F.R.E.S.H phê duyệt thành công.
    </div>
    <p>Tài khoản của bạn đã nâng lên cấp độ **Xác minh Verified**. Từ bây giờ bạn được mở khóa các đặc quyền:</p>
    <ul>
      <li>Mở rộng hạn mức giao dịch nạp/rút tiền ví F.R.E.S.H Pay.</li>
      <li>Giao dịch an toàn tuyệt đối, chống lại các rủi ro gian lận nạp giả.</li>
      <li>Ưu tiên kết nối với các AI radar quét deal VIP cận hạn.</li>
    </ul>
    <p>Cảm ơn bạn đã đồng hành xây dựng hệ sinh thái giao dịch an toàn và bền vững cùng chúng tôi.</p>
  `;

  const enContent = `
    <h2>Biometric Verification Approved!</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <div class="highlight-box" style="border-left-color: #84cc16; background-color: #f7fee7; border-color: #d9f99d; color: #3f6212;">
      <strong>🎉 CONGRATULATIONS:</strong> Your eKYC profile (Face ID) has been successfully approved by F.R.E.S.H Security Team.
    </div>
    <p>Your account has been upgraded to **Verified** status. You now unlock the following privileges:</p>
    <ul>
      <li>Extended F.R.E.S.H Pay wallet transaction limits.</li>
      <li>Maximum security coverage against payment fraud risks.</li>
      <li>Priority connection to VIP near-expiry deal AI radars.</li>
    </ul>
    <p>Thank you for partnering with us to build a safe and sustainable trading ecosystem.</p>
  `;

  return sendEmail({
    to,
    subject: '🎉 [F.R.E.S.H] Xác minh sinh trắc học thành công / Biometric Verification Approved!',
    html: getEmailLayout(viContent, enContent, 'Hồ sơ quét Face ID của bạn đã được duyệt thành công. Tài khoản đã ở trạng thái xác minh.')
  });
}

// 8. Email thông báo đối tác được duyệt / Partner KYB Approved
export async function sendPartnerApprovalEmail(to: string, name: string, orgName: string, loginUrl: string) {
  const viContent = `
    <h2>Hồ sơ đối tác đã được duyệt!</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <div class="highlight-box">
      <strong>🎉 CHÚC MỪNG:</strong> Hồ sơ đăng ký đối tác của doanh nghiệp <strong>${orgName}</strong> đã được phê duyệt thành công.
    </div>
    <p>Tài khoản đối tác của bạn đã được kích hoạt. Bạn có thể bắt đầu:</p>
    <ul>
      <li>Quản lý kho hàng và đăng sản phẩm giải cứu</li>
      <li>Theo dõi đơn hàng và doanh thu thời gian thực</li>
      <li>Quản lý chi nhánh và nhân sự</li>
      <li>Xem báo cáo tài chính, hoa hồng và hóa đơn</li>
    </ul>
    <p>Hãy nhấp vào nút bên dưới để truy cập Cổng Đối Tác:</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="button">Vào Cổng Đối Tác</a>
    </div>
  `;

  const enContent = `
    <h2>Partner Application Approved!</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <div class="highlight-box" style="border-left-color: #84cc16; background-color: #f7fee7; border-color: #d9f99d; color: #3f6212;">
      <strong>🎉 CONGRATULATIONS:</strong> Your partner application for <strong>${orgName}</strong> has been approved!
    </div>
    <p>Your partner account is now active. You can start:</p>
    <ul>
      <li>Managing inventory and listing rescue products</li>
      <li>Tracking orders and real-time revenue</li>
      <li>Managing branches and team members</li>
      <li>Viewing financial reports, commissions, and invoices</li>
    </ul>
    <p>Click the button below to access the Partner Portal:</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="button">Enter Partner Portal</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: '🎉 [F.R.E.S.H] Hồ sơ đối tác đã được duyệt / Partner Application Approved!',
    html: getEmailLayout(viContent, enContent, `Hồ sơ của ${orgName} đã được duyệt. Bạn có thể bắt đầu sử dụng hệ thống ngay!`)
  });
}

// 9. Email thông báo đối tác bị từ chối / Partner KYB Rejected
export async function sendPartnerRejectionEmail(to: string, name: string, orgName: string, reason: string) {
  const viContent = `
    <h2>Hồ sơ đối tác chưa được duyệt</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <div class="alert-box">
      <strong>⚠️ THÔNG BÁO:</strong> Hồ sơ đăng ký đối tác của doanh nghiệp <strong>${orgName}</strong> hiện chưa được phê duyệt.
    </div>
    <p><strong>Lý do:</strong> ${reason}</p>
    <p>Vui lòng cập nhật hồ sơ và gửi lại để được thẩm định. Nếu cần hỗ trợ, vui lòng liên hệ đội ngũ F.R.E.S.H qua email support@fresh-platform.com.</p>
    <div style="text-align: center;">
      <a href="${process.env.APP_URL || 'http://localhost:3001'}/partner/login" class="button">Cập nhật hồ sơ</a>
    </div>
  `;

  const enContent = `
    <h2>Partner Application Not Approved</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <div class="alert-box" style="border-left-color: #ef4444; background-color: #fef2f2; border-color: #fca5a5; color: #991b1b;">
      <strong>⚠️ NOTICE:</strong> Your partner application for <strong>${orgName}</strong> has not been approved at this time.
    </div>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Please update your application and resubmit for review. For support, contact F.R.E.S.H team at support@fresh-platform.com.</p>
    <div style="text-align: center;">
      <a href="${process.env.APP_URL || 'http://localhost:3001'}/partner/login" class="button">Update Application</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: '📋 [F.R.E.S.H] Cập nhật hồ sơ đối tác / Partner Application Update',
    html: getEmailLayout(viContent, enContent, `Hồ sơ của ${orgName} cần được cập nhật.`)
  });
}
