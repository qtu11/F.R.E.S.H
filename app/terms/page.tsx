'use client';

import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2, ShoppingBag, Store, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';

export default function TermsOfService() {
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
            <Scale className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            ĐIỀU KHOẢN DỊCH VỤ
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase"
          >
            NỀN TẢNG GIẢI CỨU THỰC PHẨM & ESG F.R.E.S.H - Cập nhật lần cuối: 26/05/2026
          </motion.p>
        </div>

        {/* Khung nội dung Điều khoản */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-10 text-gray-700 dark:text-slate-300"
        >
          {/* Giới thiệu chung */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Leaf className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
              1. Giới thiệu về F.R.E.S.H Platform
            </h2>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              Chào mừng bạn đến với <strong>F.R.E.S.H</strong> (Food Rescue – ESG – Smart Hyperlocal). Chúng tôi là nền tảng công nghệ kết nối các đơn vị cung cấp thực phẩm (nhà hàng, siêu thị, tiệm bánh) với người tiêu dùng nhằm giải cứu thực phẩm cận date (cận hạn sử dụng), giảm thiểu rác thải hữu cơ, tích lũy điểm thưởng xanh và đóng góp vào mục tiêu phát triển bền vững (ESG - Environmental, Social, and Governance).
            </p>
          </section>

          {/* Quyền lợi & Điều khoản cho Khách hàng */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              2. Điều khoản & Quyền lợi của Khách hàng
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>Khách hàng tham gia nền tảng F.R.E.S.H có các quyền lợi và nghĩa vụ sau:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Mua thực phẩm chất lượng với giá ưu đãi:</strong> Được mua các sản phẩm thực phẩm, nông sản, bánh ngọt chất lượng an toàn chuẩn vệ sinh thực phẩm với mức giá giảm sâu (từ 50% - 80%) do sản phẩm cận ngày hạn dùng hoặc dư thừa sinh hoạt.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Tích lũy điểm thưởng xanh ESG:</strong> Mỗi đơn hàng giải cứu thành công sẽ được hệ thống quy đổi thành điểm ESG đóng góp xã hội. Điểm thưởng này dùng để đổi voucher mua sắm hoặc quyên góp cho quỹ bảo vệ môi trường.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Chính sách hoàn tiền bảo vệ người tiêu dùng:</strong> Nếu thực phẩm nhận được bị hỏng, ôi thiu, không đúng mô tả hoặc hết hạn trước khi nhận hàng, khách hàng có quyền yêu cầu hoàn tiền 100% trong vòng 2 giờ kể từ khi nhận sản phẩm.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>An toàn ví tiền & thanh toán:</strong> Mọi giao dịch thông qua ví điện tử F.R.E.S.H hoặc thẻ ngân hàng liên kết đều được mã hóa SSL/TLS 256-bit bảo mật cao, cam kết không lưu thông tin thẻ thô của người dùng.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Quyền lợi & Điều khoản cho Đối tác */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Store className="w-6 h-6 text-blue-500" />
              3. Điều khoản & Quyền lợi của Đối tác
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>Đối tác (Cửa hàng, Siêu thị, Doanh nghiệp thực phẩm) tham gia F.R.E.S.H có các quyền lợi và nghĩa vụ sau:</p>
              <ul className="list-none space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Giải quyết hàng tồn kho hiệu quả:</strong> Được chủ động đăng bán hàng cận date để thu hồi chi phí sản xuất, tối ưu hóa lợi nhuận thay vì phải tiêu hủy gây lãng phí thực phẩm và ô nhiễm môi trường.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Xây dựng báo cáo ESG & Tín chỉ xanh:</strong> Hệ thống tự động ghi nhận số lượng thực phẩm giải cứu của đối tác và xuất báo cáo chỉ số ESG chuẩn hóa, giúp doanh nghiệp chứng minh hoạt động phát triển bền vững với nhà đầu tư và khách hàng.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Nghĩa vụ chất lượng thực phẩm:</strong> Đối tác cam kết tất cả thực phẩm đăng tải vẫn đảm bảo vệ sinh an toàn thực phẩm, không ôi thiu và có nguồn gốc rõ ràng. Đối tác hoàn toàn chịu trách nhiệm pháp lý nếu thực phẩm gây ảnh hưởng đến sức khỏe người tiêu dùng.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Phí dịch vụ & Đối soát doanh thu:</strong> Doanh thu từ các đơn hàng sẽ được đối soát tự động hàng tuần và chuyển khoản trực tiếp vào tài khoản của Đối tác, với mức chiết khấu nền tảng cạnh tranh nhất thị trường.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Quy định bảo mật thông tin */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              4. Bảo mật dữ liệu & Tuân thủ pháp luật
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              Chúng tôi cam kết tuân thủ nghiêm ngặt các quy định pháp luật Việt Nam (Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân) và tiêu chuẩn quốc tế (GDPR). Tất cả thông tin người dùng được thu thập tối thiểu chỉ nhằm mục đích vận hành giao dịch và nâng cao trải nghiệm ứng dụng, tuyệt đối không chia sẻ cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý rõ ràng của chủ thể dữ liệu.
            </p>
          </section>

          {/* Giải quyết tranh chấp */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              5. Giải quyết tranh chấp & Khiếu nại
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              Mọi khiếu nại, tranh chấp phát sinh từ giao dịch trên F.R.E.S.H Platform trước tiên sẽ được ưu tiên giải quyết thông qua thương lượng và hòa giải trực tuyến. Nếu các bên không thể tự hòa giải trong vòng 30 ngày kể từ ngày khiếu nại phát sinh, tranh chấp sẽ được đưa ra cơ quan tài phán có thẩm quyền tại Thành phố Hồ Chí Minh để giải quyết theo luật pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            </p>
          </section>
        </motion.div>

        {/* Nút điều hướng chân trang */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
          <span>&copy; 2026 F.R.E.S.H Platform. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Chính sách bảo mật</Link>
            <Link href="/customer/login" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
