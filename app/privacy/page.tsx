'use client';

import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, ShieldCheck, Lock, CheckCircle2, Eye, MapPin, Database, UserCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';

export default function PrivacyPolicy() {
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
        Trang chủ
      </Link>

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
            CHÍNH SÁCH BẢO MẬT
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase"
          >
            NỀN TẢNG GIẢI CỨU THỰC PHẨM & ESG F.R.E.S.H - Cập nhật lần cuối: 26/05/2026
          </motion.p>
        </div>

        {/* Khung nội dung Chính sách */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-10 text-gray-700 dark:text-slate-300"
        >
          {/* Tuyên bố chung */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Lock className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
              1. Tuyên bố về Quyền Riêng Tư
            </h2>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              Tại F.R.E.S.H, chúng tôi hiểu rằng dữ liệu cá nhân của bạn là tài sản quý báu nhất. Chúng tôi cam kết tuyệt đối bảo vệ sự riêng tư, minh bạch hóa toàn bộ quá trình thu thập thông tin và tuân thủ chặt chẽ Luật An ninh mạng Việt Nam cùng Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.
            </p>
          </section>

          {/* Dữ liệu thu thập */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Eye className="w-6 h-6 text-blue-500" />
              2. Dữ liệu cá nhân chúng tôi thu thập
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>Để tối ưu hóa việc giải cứu thực phẩm nhanh chóng theo thời gian thực (Smart Hyperlocal), F.R.E.S.H thu thập một số thông tin tối giản gồm:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#057A42] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, số điện thoại đăng ký phục vụ liên hệ giao nhận thực phẩm.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#057A42] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Định vị địa lý (Location-based):</strong> Tọa độ định vị GPS của khách hàng (sau khi được cấp quyền) để hiển thị danh sách thực phẩm cận date cần giải cứu xung quanh bán kính gần nhất (dưới 5km), tối ưu quãng đường giao nhận và giảm thiểu CO2 phát thải.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#057A42] dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dữ liệu giao dịch ví & điểm ESG:</strong> Lịch sử tích lũy điểm ESG, số lượng thực phẩm giải cứu thành công, nhật ký nạp rút ví để phục vụ cho tính minh bạch và đối soát tài chính với cửa hàng.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Cơ chế bảo vệ dữ liệu */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Database className="w-6 h-6 text-emerald-500" />
              3. Phương pháp lưu trữ và bảo vệ dữ liệu
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>Mọi dữ liệu thu thập được quản lý và bảo mật bởi các tiêu chuẩn kỹ thuật số chuyên nghiệp cao cấp nhất:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Mã hóa đầu cuối:</strong> Dữ liệu mật khẩu tài khoản được băm một chiều (salted hashing) bằng thuật toán bcrypt chất lượng cao trước khi lưu trữ vào cơ sở dữ liệu Supabase, đảm bảo không ai có thể đọc được mật khẩu thô của bạn kể cả quản trị viên hệ thống.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Không rò rỉ dữ liệu qua bên thứ 3:</strong> Chúng tôi hoàn toàn KHÔNG sử dụng bất kỳ thư viện theo dõi (tracking pixels) hay SDK quảng cáo của bên thứ ba nào. Hệ thống hoạt động độc lập và bảo mật cục bộ.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Tường lửa & Phân quyền chặt chẽ:</strong> Truy cập API được kiểm soát thông qua token JWT ký số bằng thuật toán bảo mật cao, kết hợp phân quyền rõ ràng giữa Khách hàng, Đối tác kinh doanh và Quản trị viên để tránh việc khai thác dữ liệu chéo trái phép.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Quyền của chủ thể dữ liệu */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <UserCheck className="w-6 h-6 text-blue-500" />
              4. Quyền của Chủ thể dữ liệu
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              Người dùng có toàn quyền kiểm soát dữ liệu cá nhân của mình trên nền tảng F.R.E.S.H. Bạn có quyền truy cập, chỉnh sửa thông tin hồ sơ cá nhân hoặc yêu cầu khóa/xóa hoàn toàn tài khoản và toàn bộ dữ liệu đi kèm ra khỏi hệ thống của chúng tôi bất cứ lúc nào thông qua phần Cài đặt tài khoản hoặc liên hệ trực tiếp với bộ phận Chăm sóc khách hàng.
            </p>
          </section>

          {/* Thay đổi chính sách */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              5. Thay đổi Chính sách bảo mật
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              Chính sách bảo mật này có thể được cập nhật định kỳ để phù hợp với sự phát triển của công nghệ và sự thay đổi trong các quy định pháp luật. Mọi thay đổi lớn sẽ được thông báo trực tiếp qua ứng dụng hoặc gửi email đến tài khoản đã đăng ký của bạn. Việc bạn tiếp tục sử dụng dịch vụ sau khi chính sách thay đổi đồng nghĩa với việc đồng ý với các điều khoản bảo mật cập nhật.
            </p>
          </section>
        </motion.div>

        {/* Nút điều hướng chân trang */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
          <span>&copy; 2026 F.R.E.S.H Platform. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/customer/login" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
