'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, Eye, Database, UserCheck, ShieldAlert, Globe } from 'lucide-react';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';

const content = {
  vi: {
    back: 'Trang chủ',
    title: 'CHÍNH SÁCH BẢO MẬT',
    subtitle: 'NỀN TẢNG GIẢI CỨU THỰC PHẨM & ESG F.R.E.S.H - Cập nhật lần cuối: 26/05/2026',
    section1Title: '1. Tuyên bố về Quyền Riêng Tư',
    section1Content: 'Tại F.R.E.S.H, chúng tôi hiểu rằng dữ liệu cá nhân của bạn là tài sản quý báu nhất. Chúng tôi cam kết tuyệt đối bảo vệ sự riêng tư, minh bạch hóa toàn bộ quá trình thu thập thông tin và tuân thủ chặt chẽ Luật An ninh mạng Việt Nam cùng Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.',
    section2Title: '2. Dữ liệu cá nhân chúng tôi thu thập',
    section2Intro: 'Để tối ưu hóa việc giải cứu thực phẩm nhanh chóng theo thời gian thực (Smart Hyperlocal), F.R.E.S.H thu thập một số thông tin tối giản gồm:',
    section2Items: [
      { bold: 'Thông tin tài khoản:', text: 'Họ tên, địa chỉ email, số điện thoại đăng ký phục vụ liên hệ giao nhận thực phẩm.' },
      { bold: 'Định vị địa lý (Location-based):', text: 'Tọa độ định vị GPS của khách hàng (sau khi được cấp quyền) để hiển thị danh sách thực phẩm cận date cần giải cứu xung quanh bán kính gần nhất (dưới 5km), tối ưu quãng đường giao nhận và giảm thiểu CO2 phát thải.' },
      { bold: 'Dữ liệu giao dịch ví & điểm ESG:', text: 'Lịch sử tích lũy điểm ESG, số lượng thực phẩm giải cứu thành công, nhật ký nạp rút ví để phục vụ cho tính minh bạch và đối soát tài chính với cửa hàng.' },
    ],
    section3Title: '3. Phương pháp lưu trữ và bảo vệ dữ liệu',
    section3Intro: 'Mọi dữ liệu thu thập được quản lý và bảo mật bởi các tiêu chuẩn kỹ thuật số chuyên nghiệp cao cấp nhất:',
    section3Items: [
      { bold: 'Mã hóa đầu cuối:', text: 'Dữ liệu mật khẩu tài khoản được băm một chiều (salted hashing) bằng thuật toán bcrypt chất lượng cao trước khi lưu trữ vào cơ sở dữ liệu Supabase, đảm bảo không ai có thể đọc được mật khẩu thô của bạn kể cả quản trị viên hệ thống.' },
      { bold: 'Không rò rỉ dữ liệu qua bên thứ 3:', text: 'Chúng tôi hoàn toàn KHÔNG sử dụng bất kỳ thư viện theo dõi (tracking pixels) hay SDK quảng cáo của bên thứ ba nào. Hệ thống hoạt động độc lập và bảo mật cục bộ.' },
      { bold: 'Tường lửa & Phân quyền chặt chẽ:', text: 'Truy cập API được kiểm soát thông qua token JWT ký số bằng thuật toán bảo mật cao, kết hợp phân quyền rõ ràng giữa Khách hàng, Đối tác kinh doanh và Quản trị viên để tránh việc khai thác dữ liệu chéo trái phép.' },
    ],
    section4Title: '4. Quyền của Chủ thể dữ liệu',
    section4Content: 'Người dùng có toàn quyền kiểm soát dữ liệu cá nhân của mình trên nền tảng F.R.E.S.H. Bạn có quyền truy cập, chỉnh sửa thông tin hồ sơ cá nhân hoặc yêu cầu khóa/xóa hoàn toàn tài khoản và toàn bộ dữ liệu đi kèm ra khỏi hệ thống của chúng tôi bất cứ lúc nào thông qua phần Cài đặt tài khoản hoặc liên hệ trực tiếp với bộ phận Chăm sóc khách hàng.',
    section5Title: '5. Thay đổi Chính sách bảo mật',
    section5Content: 'Chính sách bảo mật này có thể được cập nhật định kỳ để phù hợp với sự phát triển của công nghệ và sự thay đổi trong các quy định pháp luật. Mọi thay đổi lớn sẽ được thông báo trực tiếp qua ứng dụng hoặc gửi email đến tài khoản đã đăng ký của bạn. Việc bạn tiếp tục sử dụng dịch vụ sau khi chính sách thay đổi đồng nghĩa với việc đồng ý với các điều khoản bảo mật cập nhật.',
    termsLink: 'Điều khoản dịch vụ',
    loginLink: 'Đăng nhập',
  },
  en: {
    back: 'Home',
    title: 'PRIVACY POLICY',
    subtitle: 'FOOD RESCUE & ESG PLATFORM F.R.E.S.H - Last updated: May 26, 2026',
    section1Title: '1. Privacy Statement',
    section1Content: 'At F.R.E.S.H, we understand that your personal data is your most valuable asset. We are absolutely committed to protecting your privacy, ensuring full transparency in the data collection process, and strictly complying with Vietnam\'s Cybersecurity Law and Decree 13/2023/ND-CP on Personal Data Protection.',
    section2Title: '2. Personal Data We Collect',
    section2Intro: 'To optimize real-time food rescue operations (Smart Hyperlocal), F.R.E.S.H collects the following minimal information:',
    section2Items: [
      { bold: 'Account information:', text: 'Full name, email address, and registered phone number for food delivery contact purposes.' },
      { bold: 'Geolocation (Location-based):', text: 'Customer GPS coordinates (after permission is granted) to display near-expiry food products available for rescue within the nearest radius (under 5km), optimizing delivery routes and reducing CO2 emissions.' },
      { bold: 'Wallet transaction & ESG points data:', text: 'ESG points accumulation history, number of successfully rescued food items, and wallet top-up/withdrawal logs to ensure transparency and financial reconciliation with stores.' },
    ],
    section3Title: '3. Data Storage and Protection Methods',
    section3Intro: 'All collected data is managed and secured using the highest professional digital standards:',
    section3Items: [
      { bold: 'End-to-end encryption:', text: 'Account password data is one-way hashed (salted hashing) using a high-quality bcrypt algorithm before being stored in the Supabase database, ensuring that no one can read your raw password, including system administrators.' },
      { bold: 'No data leakage to third parties:', text: 'We absolutely DO NOT use any third-party tracking libraries (tracking pixels) or advertising SDKs. The system operates independently and with local security.' },
      { bold: 'Firewall & Strict access control:', text: 'API access is controlled through JWT tokens signed with high-security algorithms, combined with clear role-based access control between Customers, Business Partners, and Administrators to prevent unauthorized cross-data exploitation.' },
    ],
    section4Title: '4. Rights of the Data Subject',
    section4Content: 'Users have full control over their personal data on the F.R.E.S.H platform. You have the right to access, edit your personal profile information, or request to lock/completely delete your account and all associated data from our system at any time through Account Settings or by directly contacting Customer Support.',
    section5Title: '5. Changes to Privacy Policy',
    section5Content: 'This privacy policy may be updated periodically to keep pace with technological developments and changes in legal regulations. Any major changes will be notified directly through the application or sent via email to your registered account. Your continued use of the service after the policy changes implies your agreement to the updated privacy terms.',
    termsLink: 'Terms of Service',
    loginLink: 'Login',
  },
};

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden px-4 py-16 transition-colors duration-300">
      {/* Background động tương tác */}
      <DynamicBackground />

      {/* Nút quay lại */}
      <Link 
        href="/" 
        className="fixed top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 hover:-translate-x-1 duration-200 z-50 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.back}
      </Link>

      {/* Nút chuyển ngôn ngữ */}
      <button
        onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
        className="fixed top-6 right-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 duration-200 z-50 select-none cursor-pointer"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        {lang === 'vi' ? 'English' : 'Tiếng Việt'}
      </button>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-6 shadow-2xl transition-colors"
          >
            <ShieldCheck className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            {t.title}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Khung nội dung Chính sách */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-10 text-gray-700 dark:text-slate-300"
        >
          {/* Section 1 - Tuyên bố */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Lock className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
              {t.section1Title}
            </h2>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t.section1Content}
            </p>
          </section>

          {/* Section 2 - Dữ liệu thu thập */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Eye className="w-6 h-6 text-blue-500" />
              {t.section2Title}
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>{t.section2Intro}</p>
              <ul className="list-none space-y-2.5 pl-2">
                {t.section2Items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#057A42] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>{item.bold}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 3 - Bảo vệ dữ liệu */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Database className="w-6 h-6 text-emerald-500" />
              {t.section3Title}
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>{t.section3Intro}</p>
              <ul className="list-none space-y-2.5 pl-2">
                {t.section3Items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>{item.bold}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 4 - Quyền chủ thể */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <UserCheck className="w-6 h-6 text-blue-500" />
              {t.section4Title}
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t.section4Content}
            </p>
          </section>

          {/* Section 5 - Thay đổi */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              {t.section5Title}
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t.section5Content}
            </p>
          </section>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
          <span>&copy; 2026 F.R.E.S.H Platform. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{t.termsLink}</Link>
            <Link href="/customer/login" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{t.loginLink}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
