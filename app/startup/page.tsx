'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Leaf, Award, TrendingUp, ShieldCheck, MapPin, Users,
  Target, AlertTriangle, Coins, DollarSign, LineChart, Sparkles,
  BookOpen, ChevronRight, BarChart3, Clock, HelpCircle, FileText,
  Briefcase, Globe, Cpu, ArrowUpRight
} from 'lucide-react';
import { useGlobal } from '@/app/providers';

import { startupTranslations } from './translations';

// --- DYNAMIC DATA HELPERS ---
const getTeamMembers = (lang: 'vi' | 'en') => [
  { name: 'Trương Thị Anh Thư', mssv: '225086464', email: 'thutta22@uef.edu.vn', role: lang === 'vi' ? 'CEO & Founder - Quản trị Chiến lược & Đàm phán B2B' : 'CEO & Founder - Strategic Management & B2B Negotiation' },
  { name: 'Lương Hoàng Bửu Ngọc', mssv: '255146242', email: 'ngoclhb25@uef.edu.vn', role: lang === 'vi' ? 'COO - Vận hành chuỗi & Kiểm soát chất lượng thực phẩm' : 'COO - Supply Chain Operations & Food Quality Control' },
  { name: 'Nguyễn Thị Thanh Hằng', mssv: '235087692', email: 'hangntt23@uef.edu.vn', role: lang === 'vi' ? 'CMO - Phát triển cộng đồng & Truyền thông Gen Z' : 'CMO - Community Development & Gen Z Marketing' },
  { name: 'Nguyễn Quang Tú', mssv: '255015965', email: 'tunq25@uef.edu.vn', role: lang === 'vi' ? 'CTO - Kiến trúc sư Thuật toán AI & Tích hợp API' : 'CTO - AI Algorithm Architect & API Integration' },
];

const getFinancialProjects = (lang: 'vi' | 'en') => [
  {
    year: '2026',
    capex: 250000000,
    opex: 480000000,
    total: 730000000,
    details: {
      dev: lang === 'vi' ? '150,000,000đ (Phát triển App/AI/API)' : '150,000,000 VND (App/AI/API Development)',
      legal: lang === 'vi' ? '100,000,000đ (Pháp lý & Thương hiệu)' : '100,000,000 VND (Legal & Brand)',
      server: lang === 'vi' ? '60,000,000đ (Server/IT)' : '60,000,000 VND (Server/IT)',
      staff: lang === 'vi' ? '280,000,000đ (Nhân sự cốt lõi)' : '280,000,000 VND (Core Staff)',
      marketing: lang === 'vi' ? '100,000,000đ (Chiến dịch Pilot)' : '100,000,000 VND (Pilot Campaign)',
      reserve: lang === 'vi' ? '40,000,000đ (Dự phòng)' : '40,000,000 VND (Reserve)'
    }
  },
  {
    year: '2027',
    capex: 100000000,
    opex: 960000000,
    total: 1060000000,
    details: {
      dev: lang === 'vi' ? '80,000,000đ (Nâng cấp hệ thống)' : '80,000,000 VND (System Upgrades)',
      legal: lang === 'vi' ? '20,000,000đ (Bảo hộ & Giấy phép)' : '20,000,000 VND (Patent & Licensing)',
      server: lang === 'vi' ? '120,000,000đ (Mở rộng hạ tầng)' : '120,000,000 VND (Infrastructure Expansion)',
      staff: lang === 'vi' ? '540,000,000đ (Mở rộng CSKH)' : '540,000,000 VND (Support Team Expansion)',
      marketing: lang === 'vi' ? '250,000,000đ (Phủ sóng TP.HCM)' : '250,000,000 VND (HCMC Expansion)',
      reserve: lang === 'vi' ? '50,000,000đ (Dự phòng)' : '50,000,000 VND (Reserve)'
    }
  },
  {
    year: '2028',
    capex: 300000000,
    opex: 1800000000,
    total: 2100000000,
    details: {
      dev: lang === 'vi' ? '200,000,000đ (AI Dynamic Pricing v2)' : '200,000,000 VND (AI Dynamic Pricing v2)',
      legal: lang === 'vi' ? '100,000,000đ (Pháp lý liên tỉnh)' : '100,000,000 VND (Inter-provincial Legal)',
      server: lang === 'vi' ? '250,000,000đ (Cloud Cluster)' : '250,000,000 VND (Cloud Cluster)',
      staff: lang === 'vi' ? '1,000,000,000đ (Đội ngũ kỹ thuật)' : '1,000,000,000 VND (Engineering Team)',
      marketing: lang === 'vi' ? '450,000,000đ (Khu vực Miền Nam)' : '450,000,000 VND (Southern Region)',
      reserve: lang === 'vi' ? '100,000,000đ (Dự phòng)' : '100,000,000 VND (Reserve)'
    }
  },
  {
    year: '2029',
    capex: 500000000,
    opex: 3200000000,
    total: 3700000000,
    details: {
      dev: lang === 'vi' ? '350,000,000đ (Tích hợp sâu API siêu thị lớn)' : '350,000,000 VND (Deep Enterprise API Integration)',
      legal: lang === 'vi' ? '150,000,000đ (Thương hiệu Quốc gia)' : '150,000,000 VND (National Brand Registration)',
      server: lang === 'vi' ? '450,000,000đ (Kiến trúc Microservices)' : '450,000,000 VND (Microservices Architecture)',
      staff: lang === 'vi' ? '1,800,000,000đ (Mở rộng quy mô nhân sự)' : '1,800,000,000 VND (Scaling Workforce)',
      marketing: lang === 'vi' ? '750,000,000đ (Truyền thông Toàn quốc)' : '750,000,000 VND (National Marketing Campaigns)',
      reserve: lang === 'vi' ? '200,000,000đ (Dự phòng)' : '200,000,000 VND (Reserve)'
    }
  },
  {
    year: '2030',
    capex: 200000000,
    opex: 4500000000,
    total: 4700000000,
    details: {
      dev: lang === 'vi' ? '150,000,000đ (R&D công nghệ mới)' : '150,000,000 VND (Next-Gen Tech R&D)',
      legal: lang === 'vi' ? '50,000,000đ (Pháp lý quốc tế)' : '50,000,000 VND (International Legal)',
      server: lang === 'vi' ? '600,000,000đ (Hạ tầng lưu trữ lớn)' : '600,000,000 VND (Big Data Infrastructure)',
      staff: lang === 'vi' ? '2,500,000,000đ (Ban điều hành & Nghiên cứu)' : '2,500,000,000 VND (Executive Board & R&D)',
      marketing: lang === 'vi' ? '1,100,000,000đ (Duy trì vị thế)' : '1,100,000,000 VND (Market Position Maintenance)',
      reserve: lang === 'vi' ? '300,000,000đ (Dự phòng)' : '300,000,000 VND (Reserve)'
    }
  }
];

const getSections = (lang: 'vi' | 'en') => [
  { id: 'tong-quan', name: lang === 'vi' ? 'Mô tả & Slogan' : 'Description & Slogan', icon: Sparkles },
  { id: 'su-can-thiet', name: lang === 'vi' ? 'Sự cần thiết & Thực trạng' : 'Necessity & Market Status', icon: AlertTriangle },
  { id: 'tinh-kha-thi', name: lang === 'vi' ? 'Tính khả thi & Vận hành' : 'Feasibility & Operations', icon: Target },
  { id: 'sanh-tao', name: lang === 'vi' ? 'Độc đáo & Sáng tạo' : 'Uniqueness & AI Pricing', icon: Cpu },
  { id: 'ke-hoach', name: lang === 'vi' ? 'Kế hoạch & Dự phóng' : 'Plan & Projections', icon: LineChart },
  { id: 'nguon-luc', name: lang === 'vi' ? 'Nguồn lực thực hiện' : 'Resources & Partners', icon: Users },
  { id: 'truyen-thong', name: lang === 'vi' ? 'Kênh truyền thông' : 'Marketing Channels', icon: Briefcase }
];

export default function StartupPitchDeck() {
  const { theme, lang, setLang } = useGlobal();
  const [activeSection, setActiveSection] = useState('tong-quan');
  const [selectedYear, setSelectedYear] = useState('2026');

  const t = useCallback((key: keyof typeof startupTranslations.vi) => {
    return startupTranslations[lang]?.[key] || startupTranslations.en[key] || key;
  }, [lang]);

  const teamMembers = useMemo(() => getTeamMembers(lang), [lang]);
  const financialProjects = useMemo(() => getFinancialProjects(lang), [lang]);
  const sections = useMemo(() => getSections(lang), [lang]);

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
    return financialProjects.find(f => f.year === selectedYear) || financialProjects[0];
  }, [selectedYear, financialProjects]);

  // Set default hash route navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

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
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{t('uef_startup')}</span>
                <span className="text-xs text-slate-500 font-bold">{t('research_startup')}</span>
              </div>
              <h1 className="text-base font-black text-white uppercase tracking-tight">{t('pitch_deck_hub')}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden lg:block text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('governing_body')}</p>
              <p className="text-xs font-bold text-slate-300">{t('uef_university')}</p>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-850 rounded-full p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('vi')}
                className={`relative px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
                  lang === 'vi' ? 'text-white' : 'text-slate-400'
                }`}
              >
                VI
                {lang === 'vi' && (
                  <motion.div
                    layoutId="activeLangStartup"
                    className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setLang('en')}
                className={`relative px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
                  lang === 'en' ? 'text-white' : 'text-slate-400'
                }`}
              >
                EN
                {lang === 'en' && (
                  <motion.div
                    layoutId="activeLangStartup"
                    className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>
            
            <a href="mailto:tunq25@uef.edu.vn" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-black text-xs rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/25">
              {t('contact_team')} <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* SIDEBAR NAVIGATION (STAYS STICKY) */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">{t('project_directory')}</p>
              <nav className="space-y-1">
                {sections.map(s => (
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
              <p className="text-[9px] text-blue-400 font-black uppercase tracking-wider mb-2">{t('governing_university')}</p>
              <p className="text-xs font-bold text-white leading-relaxed">{t('uef_full_name')}</p>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">{t('moet')}</p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>{t('startup_project_year')}</span>
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
                {t('leading_zero_waste')}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] uppercase">
                {t('startup_project')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500">F.R.E.S.H</span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-bold uppercase tracking-widest mt-2">
                {t('sub_title')}
              </p>
              
              <div className="h-px bg-slate-800 my-8" />
              
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                {t('project_desc')}
              </p>
            </div>
          </div>

          {/* TEAM MEMBERS SECTION */}
          <section className="bg-slate-900/40 border border-slate-800/60 rounded-[2.2rem] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">{t('team_title')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.map((m, i) => (
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
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">1. {t('sec_desc_slogan')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <span className="text-3xl">🎯</span>
                <h3 className="font-black text-white text-sm uppercase mt-4 mb-2">{t('slogan_positioning')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('slogan_desc')}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <span className="text-3xl">⚙</span>
                <h3 className="font-black text-white text-sm uppercase mt-4 mb-2">{t('core_pillars')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('pillars_desc')}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <span className="text-3xl">🌱</span>
                <h3 className="font-black text-white text-sm uppercase mt-4 mb-2">{t('green_value')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('green_value_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: SU CAN THIET */}
          <section id="su-can-thiet" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">2. {t('sec_necessity')}</h2>
            </div>

            <div className="bg-gradient-to-br from-slate-950 to-[#0e1628] border border-slate-800 rounded-3xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                  {t('alarm_status')}
                </div>
                <h3 className="text-lg md:text-xl font-black text-white uppercase">{t('vietnam_rank')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {t('unep_vtv_stat')}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {t('market_paradox')}
                </p>
              </div>

              {/* STATS CHART DRAWN WITH DYNAMIC SVGS */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">{t('waste_chart_title')}</p>
                
                <div className="space-y-3">
                  {[
                    { label: t('chart_household'), pct: 61, color: 'bg-emerald-500' },
                    { label: t('chart_food_service'), pct: 26, color: 'bg-orange-500' },
                    { label: t('chart_retail'), pct: 13, color: 'bg-blue-500' }
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
                  {t('data_source')}
                </div>
              </div>
            </div>

            {/* Target Audience Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">👥</span>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('b2c_title')}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('b2c_desc')}
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🏪</span>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('b2b_title')}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('b2b_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: TINH KHA THI */}
          <section id="tinh-kha-thi" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">3. {t('sec_feasibility')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6">
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {t('feasibility_intro')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center text-xs">1</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('phase_1_title')}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {t('phase_1_desc')}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-black flex items-center justify-center text-xs">2</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('phase_2_title')}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {t('phase_2_desc')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: SANH TAO */}
          <section id="sanh-tao" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">4. {t('sec_uniqueness')}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                <span className="text-emerald-400 text-lg font-bold">{t('unique_1_title')}</span>
                <h4 className="font-black text-white text-xs uppercase">{t('unique_1_sub')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('unique_1_desc')}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                <span className="text-orange-400 text-lg font-bold">{t('unique_2_title')}</span>
                <h4 className="font-black text-white text-xs uppercase">{t('unique_2_sub')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('unique_2_desc')}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
                <span className="text-blue-400 text-lg font-bold">{t('unique_3_title')}</span>
                <h4 className="font-black text-white text-xs uppercase">{t('unique_3_sub')}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('unique_3_desc')}
                </p>
              </div>
            </div>

            {/* DYNAMIC PRICING FORMULA PRESENTATION */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">{t('math_title')}</p>
              <div className="inline-block bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 font-mono text-emerald-400 text-sm md:text-base">
                P_d = P_0 &times; (t_left / t_total)<sup>&alpha;</sup> &times; f(demand) &times; f(weather)
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto">
                {t('math_desc')}
              </p>
            </div>

            {/* INTERACTIVE PRICING SIMULATOR */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-[2.2rem] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">{t('sim_title')}</h3>
              </div>
              
              <p className="text-xs text-slate-400 font-medium">
                {t('sim_desc')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>{t('sim_original_price')}</span>
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
                      <span>{t('sim_hours_left')}</span>
                      <span className="text-orange-400">{hoursLeft} / {totalHours} {lang === 'vi' ? 'giờ' : 'hrs'}</span>
                    </div>
                    <input
                      type="range" min="1" max={totalHours} step="1" value={hoursLeft}
                      onChange={(e) => setHoursLeft(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                      <span>{t('sim_demand')}</span>
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
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('sim_output_title')}</p>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('sim_rescue_price')}</span>
                      <p className="text-3xl font-black text-emerald-400">{simulatedPrice.toLocaleString()} VNĐ</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">{t('sim_discount')}</span>
                        <p className="text-sm font-black text-orange-400">-{Math.round((1 - (simulatedPrice / originalPrice)) * 100)}%</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">{t('sim_co2')}</span>
                        <p className="text-sm font-black text-blue-400">~{co2SavedSimulated} kg</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 font-bold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('sim_running')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: KE HOACH & DU PHONG FINANCE */}
          <section id="ke-hoach" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">5. {t('sec_finance')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-white text-sm uppercase tracking-wider">{t('finance_sub')}</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {t('finance_desc')}
                </p>
              </div>

              {/* INTERACTIVE YEAR SELECTION PANEL */}
              <div className="flex flex-wrap gap-2">
                {financialProjects.map(f => (
                  <button
                    key={f.year}
                    onClick={() => setSelectedYear(f.year)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedYear === f.year ? 'bg-emerald-500 text-[#0b0f19] border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    {t('finance_year')} {f.year}
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
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('budget_overview')} {selectedYear}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">{t('capex')}</span>
                        <p className="text-xl font-black text-white">{selectedYearData.capex.toLocaleString()}đ</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">{t('opex')}</span>
                        <p className="text-xl font-black text-white">{selectedYearData.opex.toLocaleString()}đ</p>
                      </div>
                      <div className="h-px bg-slate-900" />
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase">{t('total_cost')}</span>
                        <p className="text-2xl font-black text-emerald-400">{selectedYearData.total.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('cost_allocation')}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Object.entries(selectedYearData.details).map(([key, val]) => (
                        <div key={key} className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                            {key === 'dev' && 'R&D/App/AI'}
                            {key === 'legal' && (lang === 'vi' ? 'Pháp lý & Thương hiệu' : 'Legal & Brand')}
                            {key === 'server' && 'IT & Cloud Server'}
                            {key === 'staff' && (lang === 'vi' ? 'Nhân sự & CSKH' : 'Staff & Support')}
                            {key === 'marketing' && (lang === 'vi' ? 'Marketing & Cộng đồng' : 'Marketing & Community')}
                            {key === 'reserve' && (lang === 'vi' ? 'Dự phòng rủi ro' : 'Financial Reserve')}
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
                <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('milestones_title')}</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: t('m_month_1_3'), shops: lang === 'vi' ? '5 điểm' : '5 stores', revenue: '24.000.000đ', active: false },
                    { label: t('m_month_4_6'), shops: lang === 'vi' ? '15 điểm' : '15 stores', revenue: '72.000.000đ', active: false },
                    { label: t('m_month_7_9'), shops: lang === 'vi' ? '30 điểm' : '30 stores', revenue: '144.000.000đ', active: false },
                    { label: t('m_month_10'), shops: lang === 'vi' ? '50 điểm' : '50 stores', revenue: '240.000.000đ', active: true, desc: t('breakeven') },
                    { label: t('m_month_11_12'), shops: lang === 'vi' ? '70 điểm' : '70 stores', revenue: '336.000.000đ', active: false }
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
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">6. {t('sec_resources')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">⚡</span>
                <h3 className="font-black text-white text-xs uppercase tracking-wider">{t('partners_title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('partners_desc')}
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <span className="text-2xl">💸</span>
                <h3 className="font-black text-white text-xs uppercase tracking-wider">{t('funding_title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {t('funding_desc')}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: TRUYEN THONG & KHAC BIET */}
          <section id="truyen-thong" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">7. {t('sec_channels')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                    {t('message_badge')}
                  </div>
                  <blockquote className="border-l-4 border-emerald-500 pl-4 text-sm font-black italic text-slate-200">
                    {t('message_quote')}
                  </blockquote>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {t('message_desc')}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-3">
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('campaigns_title')}</h4>
                  <ul className="space-y-2 text-xs text-slate-400 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {t('c_social')}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {t('c_local')}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {t('c_leaderboard')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA BACK TO HOME */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-[#0e271f] border border-emerald-800/40 rounded-[2rem] p-8 text-center space-y-6">
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">{t('try_platform')}</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-medium">
              {t('try_desc')}
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/customer" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/25">
                {t('enter_ecosystem')}
              </Link>
              <Link href="/" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                {t('home_page')}
              </Link>
            </div>
          </div>

        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 mt-20 bg-slate-950/60 py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
        <p>&copy; {new Date().getFullYear()} F.R.E.S.H Project. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">{t('footer_sig')}</p>
      </footer>

    </div>
  );
}
