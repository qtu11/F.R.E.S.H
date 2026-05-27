'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowLeft, ShieldCheck, Scale, CheckCircle2, ShoppingBag, Store, HelpCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';

const content = {
  vi: {
    back: 'Trang chủ',
    title: 'ĐIỀU KHOẢN DỊCH VỤ',
    subtitle: 'NỀN TẢNG GIẢI CỨU THỰC PHẨM & ESG F.R.E.S.H - Cập nhật lần cuối: 26/05/2026',
    section1Title: '1. Giới thiệu về F.R.E.S.H Platform',
    section1Content: 'Chào mừng bạn đến với F.R.E.S.H (Food Rescue – ESG – Smart Hyperlocal). Chúng tôi là nền tảng công nghệ kết nối các đơn vị cung cấp thực phẩm (nhà hàng, siêu thị, tiệm bánh) với người tiêu dùng nhằm giải cứu thực phẩm cận date (cận hạn sử dụng), giảm thiểu rác thải hữu cơ, tích lũy điểm thưởng xanh và đóng góp vào mục tiêu phát triển bền vững (ESG - Environmental, Social, and Governance).',
    section2Title: '2. Điều khoản & Quyền lợi của Khách hàng',
    section2Intro: 'Khách hàng tham gia nền tảng F.R.E.S.H có các quyền lợi và nghĩa vụ sau:',
    section2Items: [
      { bold: 'Mua thực phẩm chất lượng với giá ưu đãi:', text: 'Được mua các sản phẩm thực phẩm, nông sản, bánh ngọt chất lượng an toàn chuẩn vệ sinh thực phẩm với mức giá giảm sâu (từ 50% - 80%) do sản phẩm cận ngày hạn dùng hoặc dư thừa sinh hoạt.' },
      { bold: 'Tích lũy điểm thưởng xanh ESG:', text: 'Mỗi đơn hàng giải cứu thành công sẽ được hệ thống quy đổi thành điểm ESG đóng góp xã hội. Điểm thưởng này dùng để đổi voucher mua sắm hoặc quyên góp cho quỹ bảo vệ môi trường.' },
      { bold: 'Chính sách hoàn tiền bảo vệ người tiêu dùng:', text: 'Nếu thực phẩm nhận được bị hỏng, ôi thiu, không đúng mô tả hoặc hết hạn trước khi nhận hàng, khách hàng có quyền yêu cầu hoàn tiền 100% trong vòng 2 giờ kể từ khi nhận sản phẩm.' },
      { bold: 'An toàn ví tiền & thanh toán:', text: 'Mọi giao dịch thông qua ví điện tử F.R.E.S.H hoặc thẻ ngân hàng liên kết đều được mã hóa SSL/TLS 256-bit bảo mật cao, cam kết không lưu thông tin thẻ thô của người dùng.' },
    ],
    section3Title: '3. Điều khoản & Quyền lợi của Đối tác',
    section3Intro: 'Đối tác (Cửa hàng, Siêu thị, Doanh nghiệp thực phẩm) tham gia F.R.E.S.H có các quyền lợi và nghĩa vụ sau:',
    section3Items: [
      { bold: 'Giải quyết hàng tồn kho hiệu quả:', text: 'Được chủ động đăng bán hàng cận date để thu hồi chi phí sản xuất, tối ưu hóa lợi nhuận thay vì phải tiêu hủy gây lãng phí thực phẩm và ô nhiễm môi trường.' },
      { bold: 'Xây dựng báo cáo ESG & Tín chỉ xanh:', text: 'Hệ thống tự động ghi nhận số lượng thực phẩm giải cứu của đối tác và xuất báo cáo chỉ số ESG chuẩn hóa, giúp doanh nghiệp chứng minh hoạt động phát triển bền vững với nhà đầu tư và khách hàng.' },
      { bold: 'Nghĩa vụ chất lượng thực phẩm:', text: 'Đối tác cam kết tất cả thực phẩm đăng tải vẫn đảm bảo vệ sinh an toàn thực phẩm, không ôi thiu và có nguồn gốc rõ ràng. Đối tác hoàn toàn chịu trách nhiệm pháp lý nếu thực phẩm gây ảnh hưởng đến sức khỏe người tiêu dùng.' },
      { bold: 'Phí dịch vụ & Đối soát doanh thu:', text: 'Doanh thu từ các đơn hàng sẽ được đối soát tự động hàng tuần và chuyển khoản trực tiếp vào tài khoản của Đối tác, với mức chiết khấu nền tảng cạnh tranh nhất thị trường.' },
    ],
    section4Title: '4. Bảo mật dữ liệu & Tuân thủ pháp luật',
    section4Content: 'Chúng tôi cam kết tuân thủ nghiêm ngặt các quy định pháp luật Việt Nam (Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân) và tiêu chuẩn quốc tế (GDPR). Tất cả thông tin người dùng được thu thập tối thiểu chỉ nhằm mục đích vận hành giao dịch và nâng cao trải nghiệm ứng dụng, tuyệt đối không chia sẻ cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý rõ ràng của chủ thể dữ liệu.',
    section5Title: '5. Giải quyết tranh chấp & Khiếu nại',
    section5Content: 'Mọi khiếu nại, tranh chấp phát sinh từ giao dịch trên F.R.E.S.H Platform trước tiên sẽ được ưu tiên giải quyết thông qua thương lượng và hòa giải trực tuyến. Nếu các bên không thể tự hòa giải trong vòng 30 ngày kể từ ngày khiếu nại phát sinh, tranh chấp sẽ được đưa ra cơ quan tài phán có thẩm quyền tại Thành phố Hồ Chí Minh để giải quyết theo luật pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.',
    privacyLink: 'Chính sách bảo mật',
    loginLink: 'Đăng nhập',
  },
  en: {
    back: 'Home',
    title: 'TERMS OF SERVICE',
    subtitle: 'FOOD RESCUE & ESG PLATFORM F.R.E.S.H - Last updated: May 26, 2026',
    section1Title: '1. About F.R.E.S.H Platform',
    section1Content: 'Welcome to F.R.E.S.H (Food Rescue – ESG – Smart Hyperlocal). We are a technology platform connecting food providers (restaurants, supermarkets, bakeries) with consumers to rescue near-expiry food products, reduce organic waste, accumulate green reward points, and contribute to sustainable development goals (ESG - Environmental, Social, and Governance).',
    section2Title: '2. Terms & Rights for Customers',
    section2Intro: 'Customers participating in the F.R.E.S.H platform have the following rights and obligations:',
    section2Items: [
      { bold: 'Purchase quality food at discounted prices:', text: 'Access food products, agricultural goods, and pastries that meet food safety and hygiene standards at deeply discounted prices (50% - 80% off) due to near-expiry dates or surplus inventory.' },
      { bold: 'Accumulate ESG green reward points:', text: 'Each successful food rescue order is converted into ESG social contribution points by the system. These reward points can be exchanged for shopping vouchers or donated to environmental protection funds.' },
      { bold: 'Consumer protection refund policy:', text: 'If the food received is damaged, spoiled, not as described, or expired before delivery, customers have the right to request a 100% refund within 2 hours of receiving the product.' },
      { bold: 'Wallet & payment security:', text: 'All transactions through the F.R.E.S.H e-wallet or linked bank cards are encrypted with 256-bit SSL/TLS high-security encryption. We commit to never storing raw card information of users.' },
    ],
    section3Title: '3. Terms & Rights for Partners',
    section3Intro: 'Partners (Stores, Supermarkets, Food Businesses) participating in F.R.E.S.H have the following rights and obligations:',
    section3Items: [
      { bold: 'Efficient inventory management:', text: 'Partners can proactively list near-expiry products to recover production costs and optimize profits instead of disposing of them, which would waste food and pollute the environment.' },
      { bold: 'Build ESG reports & Green credits:', text: 'The system automatically records the quantity of food rescued by each partner and generates standardized ESG index reports, helping businesses demonstrate their sustainable development activities to investors and customers.' },
      { bold: 'Food quality obligations:', text: 'Partners commit that all listed food products remain safe for consumption, are not spoiled, and have clear origins. Partners bear full legal responsibility if food products adversely affect consumer health.' },
      { bold: 'Service fees & Revenue reconciliation:', text: 'Revenue from orders is automatically reconciled weekly and transferred directly to the Partner\'s account, with the most competitive platform commission rate in the market.' },
    ],
    section4Title: '4. Data Security & Legal Compliance',
    section4Content: 'We are committed to strict compliance with Vietnamese law (Decree 13/2023/ND-CP on Personal Data Protection) and international standards (GDPR). All user information is collected minimally solely for the purpose of operating transactions and enhancing the application experience. It is absolutely not shared with any third party without the explicit consent of the data subject.',
    section5Title: '5. Dispute Resolution & Complaints',
    section5Content: 'All complaints and disputes arising from transactions on the F.R.E.S.H Platform will first be prioritized for resolution through negotiation and online mediation. If the parties cannot self-mediate within 30 days from the date the complaint arises, the dispute will be referred to the competent jurisdiction in Ho Chi Minh City for resolution under the laws of the Socialist Republic of Vietnam.',
    privacyLink: 'Privacy Policy',
    loginLink: 'Login',
  },
};

export default function TermsOfService() {
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
            <Scale className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
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

        {/* Khung nội dung Điều khoản */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-10 text-gray-700 dark:text-slate-300"
        >
          {/* Section 1 - Giới thiệu */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Leaf className="w-6 h-6 text-[#057A42] dark:text-emerald-400" />
              {t.section1Title}
            </h2>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t.section1Content}
            </p>
          </section>

          {/* Section 2 - Khách hàng */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              {t.section2Title}
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>{t.section2Intro}</p>
              <ul className="list-none space-y-2.5 pl-2">
                {t.section2Items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>{item.bold}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 3 - Đối tác */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <Store className="w-6 h-6 text-blue-500" />
              {t.section3Title}
            </h3>
            <div className="space-y-3 text-sm md:text-base font-medium leading-relaxed">
              <p>{t.section3Intro}</p>
              <ul className="list-none space-y-2.5 pl-2">
                {t.section3Items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span><strong>{item.bold}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 4 - Bảo mật */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              {t.section4Title}
            </h3>
            <p className="leading-relaxed text-sm md:text-base font-medium">
              {t.section4Content}
            </p>
          </section>

          {/* Section 5 - Tranh chấp */}
          <section className="space-y-4 border-t border-gray-100 dark:border-slate-800 pt-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-tight">
              <HelpCircle className="w-6 h-6 text-amber-500" />
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
            <Link href="/privacy" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{t.privacyLink}</Link>
            <Link href="/customer/login" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">{t.loginLink}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
