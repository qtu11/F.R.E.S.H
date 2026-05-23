'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Leaf, Award, TrendingUp, ShieldCheck, MapPin, Users,
  Target, AlertTriangle, Coins, DollarSign, LineChart, Sparkles,
  BookOpen, ChevronRight, BarChart3, Clock, HelpCircle, FileText,
  Briefcase, Globe, Cpu, ArrowUpRight
} from 'lucide-react';
import { useGlobal } from '@/app/providers';

// --- DATA ---
const TEAM_MEMBERS = [
  { name: 'Trương Thị Anh Thư', mssv: '225086464', email: 'thutta22@uef.edu.vn', role: 'CEO & Founder - Quản trị Chiến lược & Đàm phán B2B' },
  { name: 'Lương Hoàng Bửu Ngọc', mssv: '255146242', email: 'ngoclhb25@uef.edu.vn', role: 'COO - Vận hành chuỗi & Kiểm soát chất lượng thực phẩm' },
  { name: 'Nguyễn Thị Thanh Hằng', mssv: '235087692', email: 'hangntt23@uef.edu.vn', role: 'CMO - Phát triển cộng đồng & Truyền thông Gen Z' },
  { name: 'Nguyễn Quang Tú', mssv: '255015965', email: 'tunq25@uef.edu.vn', role: 'CTO - Kiến trúc sư Thuật toán AI & Tích hợp API' },
];

const FINANCIAL_PROJECTS = [
  {
    year: '2026',
    capex: 250000000,
    opex: 480000000,
    total: 730000000,
    details: {
      dev: '150,000,000đ (Phát triển App/AI/API)',
      legal: '100,000,000đ (Pháp lý & Thương hiệu)',
      server: '60,000,000đ (Server/IT)',
      staff: '280,000,000đ (Nhân sự cốt lõi)',
      marketing: '100,000,000đ (Chiến dịch Pilot)',
      reserve: '40,000,000đ (Dự phòng)'
    }
  },
  {
    year: '2027',
    capex: 100000000,
    opex: 960000000,
    total: 1060000000,
    details: {
      dev: '80,000,000đ (Nâng cấp hệ thống)',
      legal: '20,000,000đ (Bảo hộ & Giấy phép)',
      server: '120,000,000đ (Mở rộng hạ tầng)',
      staff: '540,000,000đ (Mở rộng CSKH)',
      marketing: '250,000,000đ (Phủ sóng TP.HCM)',
      reserve: '50,000,000đ (Dự phòng)'
    }
  },
  {
    year: '2028',
    capex: 300000000,
    opex: 1800000000,
    total: 2100000000,
    details: {
      dev: '200,000,000đ (AI Dynamic Pricing v2)',
      legal: '100,000,000đ (Pháp lý liên tỉnh)',
      server: '250,000,000đ (Cloud Cluster)',
      staff: '1,000,000,000đ (Đội ngũ kỹ thuật)',
      marketing: '450,000,000đ (Khu vực Miền Nam)',
      reserve: '100,000,000đ (Dự phòng)'
    }
  },
  {
    year: '2029',
    capex: 500000000,
    opex: 3200000000,
    total: 3700000000,
    details: {
      dev: '350,000,000đ (Tích hợp sâu API siêu thị lớn)',
      legal: '150,000,000đ (Thương hiệu Quốc gia)',
      server: '450,000,000đ (Kiến trúc Microservices)',
      staff: '1,800,000,000đ (Mở rộng quy mô nhân sự)',
      marketing: '750,000,000đ (Truyền thông Toàn quốc)',
      reserve: '200,000,000đ (Dự phòng)'
    }
  },
  {
    year: '2030',
    capex: 200000000,
    opex: 4500000000,
    total: 4700000000,
    details: {
      dev: '150,000,000đ (R&D công nghệ mới)',
      legal: '50,000,000đ (Pháp lý quốc tế)',
      server: '600,000,000đ (Hạ tầng lưu trữ lớn)',
      staff: '2,500,000,000đ (Ban điều hành & Nghiên cứu)',
      marketing: '1,100,000,000đ (Duy trì vị thế)',
      reserve: '300,000,000đ (Dự phòng)'
    }
  }
];

const SECTIONS = [
  { id: 'tong-quan', name: 'Mô tả & Slogan', icon: Sparkles },
  { id: 'su-can-thiet', name: 'Sự cần thiết & Thực trạng', icon: AlertTriangle },
  { id: 'tinh-kha-thi', name: 'Tính khả thi & Vận hành', icon: Target },
  { id: 'sanh-tao', name: 'Độc đáo & Sáng tạo', icon: Cpu },
  { id: 'ke-hoach', name: 'Kế hoạch & Dự phóng', icon: LineChart },
  { id: 'nguon-luc', name: 'Nguồn lực thực hiện', icon: Users },
  { id: 'truyen-thong', name: 'Kênh truyền thông', icon: Briefcase }
];

export default function StartupPitchDeck() {
  const { theme } = useGlobal();
  const [activeSection, setActiveSection] = useState('tong-quan');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Interactive Pricing Simulator States
  const [originalPrice, setOriginalPrice] = useState(100000);
  const [hoursLeft, setHoursLeft] = useState(24);
  const [totalHours, setTotalHours] = useState(48);
  const [demandFactor, setDemandFactor] = useState(1.0); // 0.5 to 1.5
  const [weatherFactor, setWeatherFactor] = useState(1.0); // 0.8 to 1.2

  // Formula Calculation
  // Pd = P0 * (hoursLeft / totalHours) ^ 0.7 * demandFactor * weatherFactor
  const simulatedPrice = useMemo(() => {
    const ratio = hoursLeft / totalHours;
    const decay = Math.pow(ratio, 0.65);
    const calculated = originalPrice * decay * demandFactor * weatherFactor;
    return Math.max(originalPrice * 0.3, Math.min(originalPrice, Math.round(calculated / 1000) * 1000));
  }, [originalPrice, hoursLeft, totalHours, demandFactor, weatherFactor]);

  const co2SavedSimulated = useMemo(() => {
    // 1 unit of food saved approx 2.5kg CO2
    return (2.5 * (1 + (originalPrice / 200000))).toFixed(2);
  }, [originalPrice]);

  const selectedYearData = useMemo(() => {
    return FINANCIAL_PROJECTS.find(f => f.year === selectedYear) || FINANCIAL_PROJECTS[0];
  }, [selectedYear]);

  // Set default hash route navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#0b0f19] text-slate-100 min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[35%] h-[35%] bg-gradient-to-r from-orange-500/5 to-transparent rounded-full blur-[130px]" />
      </div>

      {/* TOP DECK HEADER */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">UEF Startup</span>
                <span className="text-xs text-slate-500 font-bold">Dự án Nghiên cứu & Khởi nghiệp</span>
              </div>
              <h1 className="text-base font-black text-white uppercase tracking-tight">F.R.E.S.H - Pitch Deck Hub</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cơ quan chủ quản</p>
              <p className="text-xs font-bold text-slate-300">Đại học Kinh tế - Tài chính TP.HCM</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <a href="mailto:tunq25@uef.edu.vn" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-black text-xs rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/25">
              Liên hệ Nhóm <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* SIDEBAR NAVIGATION (STAYS STICKY) */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Danh mục đề án</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setActiveSection(s.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left ${activeSection === s.id ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
                  >
                    <s.icon className={`w-4 h-4 ${activeSection === s.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {s.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* School Signature Panel */}
            <div className="bg-gradient-to-br from-slate-900 via-[#0a1424] to-[#070e1a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
              <p className="text-[9px] text-blue-400 font-black uppercase tracking-wider mb-2">Đại học chủ quản</p>
              <p className="text-xs font-bold text-white leading-relaxed">TRƯỜNG ĐẠI HỌC KINH TẾ - TÀI CHÍNH THÀNH PHỐ HỒ CHÍ MINH</p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">BỘ GIÁO DỤC VÀ ĐÀO TẠO</p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>Dự án Khởi nghiệp 2026</span>
                <span className="text-emerald-400">F.R.E.S.H AI</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN DECK CONTENT */}
        <main className="lg:col-span-3 space-y-16">

          {/* STARTUP HERO COVER CARD */}
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-[#0a1e35] to-[#0a1122] border border-slate-800/80 p-8 md:p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Leaf className="w-3 h-3 text-emerald-400 animate-pulse" />
                Leading the Zero-Waste Revolution
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] uppercase">
                DỰ ÁN KHỞI NGHIỆP <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500">F.R.E.S.H</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-bold uppercase tracking-widest mt-2">
                Công nghệ quản trị hàng tồn kho và sống xanh
              </p>
              
              <div className="h-px bg-slate-800 my-8" />
              
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                F.R.E.S.H là nền tảng FoodTech tiên phong tại Việt Nam, cung cấp Giải pháp Quản trị Hàng tồn thông minh và Tối ưu hóa ESG. Sử dụng AI Dynamic Pricing kết nối các nhà bán lẻ với người tiêu dùng để phân phối thực phẩm cận date, giảm thiểu rác thải carbon.
              </p>
            </div>
          </div>

          {/* TEAM MEMBERS SECTION */}
          <section className="bg-slate-900/40 border border-slate-800/60 rounded-[2.2rem] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Đội ngũ sinh viên thực hiện</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEAM_MEMBERS.map((m, i) => (
                <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                  <p className="text-[10px] text-emerald-400 font-black tracking-widest uppercase mb-1">{m.mssv}</p>
                  <h3 className="font-black text-white text-base group-hover:text-emerald-400 transition-colors">{m.name}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-2">{m.role}</p>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                    <span>Email: {m.email}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: TONG QUAN */}
          <section id="tong-quan" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">1. Mô tả dự án & Slogan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <span className="text-3xl">🎯</span>
                <h3 className="font-black text-white text-sm uppercase mt-4 mb-2">Slogan & Định Vị</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  &quot;Leading the Zero-Waste Revolution&quot; - Dẫn đầu cuộc cách mạng không rác thải. Định vị trong lĩnh vực FoodTech và Kinh tế tuần hoàn.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <span className="text-3xl">⚙</span>
                <h3 className="font-black text-white text-sm uppercase mt-4 mb-2">Trụ Cột Cốt Lõi</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Tối ưu hóa hàng tồn cận date bằng thuật toán định giá động AI, kết nối B2B (các chuỗi siêu thị GS25, WinMart) với B2C (Gen Z, sinh viên).
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <span className="text-3xl">🌱</span>
                <h3 className="font-black text-white text-sm uppercase mt-4 mb-2">Giá Trị Xanh (SDG 12)</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Bảo vệ môi trường thông qua việc định lượng lượng CO2 giảm thải tương ứng của mỗi món ăn giải cứu, quy đổi thành Tín chỉ Xanh (Green Credit).
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: SU CAN THIET */}
          <section id="su-can-thiet" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">2. Sự cần thiết & Thực trạng thị trường</h2>
            </div>

            <div className="bg-gradient-to-br from-slate-950 to-[#0e1628] border border-slate-800 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                  Thực trạng đáng báo động
                </div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase">Việt Nam đứng thứ 2 thế giới về chỉ số lãng phí thực phẩm</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Theo số liệu của UNEP và VTV, trung bình một người dân Việt Nam lãng phí từ <strong className="text-red-400 font-bold">79kg - 121kg</strong> thực phẩm mỗi năm. Đây là một sự thất thoát tài chính và tài nguyên vô cùng khủng khiếp.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Trong khi các siêu thị phải tiêu hủy hàng tấn thực phẩm cận date mỗi ngày để dọn kho, lạm phát và bão giá đã đẩy chỉ số giá tiêu dùng (CPI) nhóm lương thực tăng vọt hơn <strong className="text-emerald-400 font-bold">12.19%</strong>. F.R.E.S.H ra đời để giải quyết triệt để nghịch lý tàn khốc này.
                </p>
              </div>

              {/* STATS CHART DRAWN WITH DYNAMIC SVGS */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Tỷ Lệ Lãng Phí Thực Phẩm Trong Chuỗi Cung Ứng</p>
                
                <div className="space-y-3">
                  {[
                    { label: 'Hộ gia đình', pct: 61, color: 'bg-emerald-500' },
                    { label: 'Dịch vụ ăn uống', pct: 26, color: 'bg-orange-500' },
                    { label: 'Chuỗi bán lẻ (Siêu thị...)', pct: 13, color: 'bg-blue-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>{item.label}</span>
                        <span>{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${item.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: idx * 0.15 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-[9px] text-slate-500 italic text-center pt-2">
                  Nguồn dữ liệu: UNEP Food Waste Index Report & Đài truyền hình VTV (2024)
                </div>
              </div>
            </div>

            {/* Target Audience Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">👥</span>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">Khách hàng B2C (Giai đoạn 1)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Sinh viên Đại học (UEF, v.v.), nhân viên văn phòng trẻ, Gen Z tại TP.HCM. Đặc tính: cực kỳ nhạy cảm về giá, thích phong cách sống xanh hiện đại và quan tâm đến các giá trị phát triển bền vững ESG.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🏪</span>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">Đối tác B2B (Siêu thị & Cửa hàng)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Chuỗi bán lẻ hiện đại (WinMart+, GS25, Circle K, Aeon, Co.opmart), cửa hàng tiện lợi, tiệm bánh ngọt. Mục tiêu: giảm thiểu hàng hủy (shrink), tối ưu vốn thu hồi từ hàng tồn và nâng cao chỉ số ESG của doanh nghiệp.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: TINH KHA THI */}
          <section id="tinh-kha-thi" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">3. Tính khả thi & Chiến lược Vận hành</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6">
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                F.R.E.S.H áp dụng chiến thuật <strong>&quot;Lãnh đạo từng bước&quot;</strong> để đảm bảo tính khả thi tuyệt đối mà không cần siêu thị phải tích hợp hệ thống POS bảo mật ngay từ đầu:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center text-xs">1</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">Giai đoạn 1: Mô hình Partner-App độc lập</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Cung cấp app riêng cực kỳ đơn giản cho nhân viên siêu thị. Nhân viên chỉ cần quét mã vạch sản phẩm cận date. AI sẽ tự động đọc danh mục, hạn dùng và đẩy lên sàn cứu hộ, dẹp bỏ rào cản can thiệp hệ thống POS.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-black flex items-center justify-center text-xs">2</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">Giai đoạn 2: Tích hợp API hệ thống kho</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Khi đã chứng minh được doanh thu thực tế và thiết lập lòng tin vững chắc, dự án sẽ đồng bộ hóa tự động API với hệ thống quản lý kho của đối tác để tối ưu nguồn lực nhân sự tự động hóa 100%.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: SANH TAO */}
          <section id="sanh-tao" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">4. Tính độc đáo & Trình mô phỏng Định giá AI</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                <span className="text-emerald-400 text-lg font-bold">01. Bản địa hóa sắc bén</span>
                <h4 className="font-black text-white text-xs uppercase">Bán món lẻ thay vì túi mù</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Khác với các đối thủ quốc tế Too Good To Go (bán túi mù thiếu minh bạch), F.R.E.S.H lựa chọn hiển thị minh bạch từng sản phẩm để người dùng tự chọn, đánh trúng tâm lý sinh viên Việt Nam.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                <span className="text-orange-400 text-lg font-bold">02. Tín dụng Xanh (Green Credit)</span>
                <h4 className="font-black text-white text-xs uppercase">Quy đổi carbon thành giá trị</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Điểm thưởng được quy đổi dựa trên lượng CO2 giảm thiểu. Điểm dùng để nhận voucher, giảm học phí tại trường ĐH hoặc xuất chứng chỉ lãnh đạo xanh gắn thẳng lên hồ sơ LinkedIn.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                <span className="text-blue-400 text-lg font-bold">03. AI Dynamic Pricing Engine</span>
                <h4 className="font-black text-white text-xs uppercase">Thuật toán tối ưu hóa thời gian thực</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  AI liên tục điều chỉnh giá bán theo từng phút dựa trên hạn dùng còn lại, tồn kho hiện tại, thời tiết địa phương và nhu cầu của thị trường.
                </p>
              </div>
            </div>

            {/* DYNAMIC PRICING FORMULA PRESENTATION */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Hàm toán học tối ưu hóa lợi nhuận AI</p>
              <div className="inline-block bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 font-mono text-emerald-400 text-sm md:text-base">
                P_d = P_0 &times; (t_left / t_total)<sup>&alpha;</sup> &times; f(demand) &times; f(weather)
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto">
                Trong đó, <strong>P_d</strong> là giá AI đề xuất, <strong>P_0</strong> là giá gốc, <strong>&alpha;</strong> là hệ số suy hao (decay coefficient = 0.65), kết hợp với hàm nhu cầu và thời tiết địa phương.
              </p>
            </div>

            {/* INTERACTIVE PRICING SIMULATOR */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-[2.2rem] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">Bản mô phỏng AI Dynamic Pricing thời gian thực</h3>
              </div>
              
              <p className="text-xs text-slate-400 font-medium">
                Kéo các thanh trượt bên dưới để xem thuật toán AI của F.R.E.S.H tự động thay đổi giá cứu hộ và tính toán lượng CO2 giảm thiểu:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Giá gốc sản phẩm:</span>
                      <span className="text-emerald-400">{originalPrice.toLocaleString()} VNĐ</span>
                    </div>
                    <input
                      type="range" min="10000" max="500000" step="5000" value={originalPrice}
                      onChange={(e) => setOriginalPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Số giờ còn lại đến hạn hủy:</span>
                      <span className="text-orange-400">{hoursLeft} / {totalHours} giờ</span>
                    </div>
                    <input
                      type="range" min="1" max={totalHours} step="1" value={hoursLeft}
                      onChange={(e) => setHoursLeft(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>Nhu cầu thị trường (Demand):</span>
                      <span className="text-blue-400">x{demandFactor.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0.5" max="1.5" step="0.1" value={demandFactor}
                      onChange={(e) => setDemandFactor(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                {/* AI Outputs */}
                <div className="bg-slate-950 rounded-2xl p-6 flex flex-col justify-between border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
                  
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI đề xuất giá & carbon</p>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Giá bán cứu hộ AI</span>
                      <p className="text-3xl font-black text-emerald-400">{simulatedPrice.toLocaleString()} VNĐ</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">Mức giảm giá</span>
                        <p className="text-sm font-black text-orange-400">-{Math.round((1 - (simulatedPrice / originalPrice)) * 100)}%</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">CO₂ giảm thiểu</span>
                        <p className="text-sm font-black text-blue-400">~{co2SavedSimulated} kg</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 font-bold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Thuật toán đang chạy tự động</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: KE HOACH & DU PHONG FINANCE */}
          <section id="ke-hoach" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">5. Kế hoạch kinh doanh & Dự phóng Tài chính (2026-2030)</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-white text-sm uppercase tracking-wider">Dự phóng chi tiết dòng tiền (Đơn vị: VNĐ)</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Với số vốn đầu tư ban đầu (CAPEX) 250 triệu và chi phí vận hành (OPEX) khoảng 40 triệu/tháng, dự án được hoạch định đạt <strong>điểm hòa vốn vào tháng thứ 10</strong>.
                </p>
              </div>

              {/* INTERACTIVE YEAR SELECTION PANEL */}
              <div className="flex flex-wrap gap-2">
                {FINANCIAL_PROJECTS.map(f => (
                  <button
                    key={f.year}
                    onClick={() => setSelectedYear(f.year)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedYear === f.year ? 'bg-emerald-500 text-[#0b0f19] border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Năm {f.year}
                  </button>
                ))}
              </div>

              {/* YEAR DETAIL WINDOW */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedYear}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tổng quan ngân sách {selectedYear}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Đầu tư (CAPEX)</span>
                        <p className="text-xl font-black text-white">{selectedYearData.capex.toLocaleString()}đ</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">Vận hành (OPEX)</span>
                        <p className="text-xl font-black text-white">{selectedYearData.opex.toLocaleString()}đ</p>
                      </div>
                      <div className="h-px bg-slate-900" />
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase">Tổng chi phí dự kiến</span>
                        <p className="text-2xl font-black text-emerald-400">{selectedYearData.total.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phân bổ chi phí cụ thể</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Object.entries(selectedYearData.details).map(([key, val]) => (
                        <div key={key} className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                            {key === 'dev' && 'R&D/App/AI'}
                            {key === 'legal' && 'Pháp lý & Thương hiệu'}
                            {key === 'server' && 'IT & Cloud Server'}
                            {key === 'staff' && 'Nhân sự & CSKH'}
                            {key === 'marketing' && 'Marketing & Cộng đồng'}
                            {key === 'reserve' && 'Dự phòng rủi ro'}
                          </span>
                          <span className="font-bold text-slate-300">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* PILOT YEAR REVENUE MILESTONES */}
              <div className="space-y-4 pt-4">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">Cột mốc doanh thu giai đoạn Pilot (Năm 2026)</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: 'Tháng 1-3', shops: '5 điểm', revenue: '24.000.000đ', active: false },
                    { label: 'Tháng 4-6', shops: '15 điểm', revenue: '72.000.000đ', active: false },
                    { label: 'Tháng 7-9', shops: '30 điểm', revenue: '144.000.000đ', active: false },
                    { label: 'Tháng 10', shops: '50 điểm', revenue: '240.000.000đ', active: true, desc: 'Hòa vốn' },
                    { label: 'Tháng 11-12', shops: '70 điểm', revenue: '336.000.000đ', active: false }
                  ].map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3.5 border transition-all text-center relative ${milestone.active ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-950/80 border-slate-850'}`}
                    >
                      {milestone.active && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0b0f19] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          {milestone.desc}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{milestone.label}</p>
                      <p className="text-sm font-black text-white mt-1">{milestone.shops}</p>
                      <p className="text-xs font-bold text-emerald-400 mt-1">{milestone.revenue}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: NGUON LUC */}
          <section id="nguon-luc" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">6. Huy động nguồn lực & Đối tác</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">⚡</span>
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Đối tác chính trong Hệ sinh thái</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Các chuỗi bán lẻ, siêu thị tiện lợi đối tác; Hệ thống các trường Đại học (phối hợp triển khai tích lũy Green Credit đổi quà); Công ty bảo hiểm rủi ro thực phẩm; Cổng thanh toán ví điện tử.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">💸</span>
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Kế hoạch huy động vốn</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Bắt đầu bằng hình thức tự thân vận hành (Bootstrapping) =&gt; Kêu gọi vốn hạt giống (Seed) từ các cuộc thi và quỹ hỗ trợ ESG, vườn ươm sinh viên =&gt; Kêu gọi nhà đầu tư thiên thần (Angel Investors) khi đạt mốc hòa vốn.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: TRUYEN THONG & KHAC BIET */}
          <section id="truyen-thong" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">7. Kênh truyền thông & Giải pháp khác biệt</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                    Thông điệp chủ đạo
                  </div>
                  <blockquote className="border-l-4 border-emerald-500 pl-4 text-sm font-black italic text-slate-200">
                    &quot;Sống Xanh không khó, lại còn rẻ!&quot; và <br />
                    &quot;Green Credit - Chứng chỉ xanh nâng tầm sự nghiệp.&quot;
                  </blockquote>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Không đánh vào sự thương hại giải cứu thực phẩm thông thường, F.R.E.S.H đề cao tính thời thượng, thông minh và sành điệu trong lối sống tiêu dùng xanh của người trẻ.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-3">
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">Chiến dịch trọng tâm</h4>
                  <ul className="space-y-2 text-xs text-slate-400 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Social Media (TikTok, IG Reels) Food Rescue Challenge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Local Activation: Bảng hiệu Signage thông minh tại điểm bán
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Bảng xếp hạng Waste Warriors hàng tháng trên ứng dụng
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA BACK TO HOME */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-[#0e271f] border border-emerald-800/40 rounded-[2rem] p-8 text-center space-y-6">
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Trải nghiệm Nền tảng ngay bây giờ</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-medium">
              Chạy thử nghiệm giao diện app dành cho khách hàng, đối tác cửa hàng hoặc bảng quản trị hệ thống của F.R.E.S.H.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/customer" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/25">
                Vào Hệ sinh thái
              </Link>
              <Link href="/" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                Trang chủ Landing Page
              </Link>
            </div>
          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-20 bg-slate-950/60 py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
        <p>&copy; {new Date().getFullYear()} F.R.E.S.H Project. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">Đề án Khởi nghiệp trường ĐH Kinh tế - Tài chính TP.HCM (UEF)</p>
      </footer>

    </div>
  );
}
