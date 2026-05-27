'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Leaf, Award, TrendingUp, ShieldCheck, MapPin, Users,
  Target, AlertTriangle, Coins, DollarSign, LineChart, Sparkles,
  BookOpen, ChevronRight, BarChart3, Clock, HelpCircle, FileText,
  Briefcase, Globe, Cpu, ArrowUpRight, Activity, GitBranch, LeafyGreen, Swords
} from 'lucide-react';
import { useGlobal } from '@/app/providers';

import { startupTranslations } from './translations';

// --- DYNAMIC DATA HELPERS ---
const getTeamMembers = (lang: 'vi' | 'en') => [
  { name: 'Trương Thị Anh Thư', mssv: '225086464', email: 'thutta22@uef.edu.vn', role: lang === 'vi' ? 'CEO & Product Lead - Quản trị Chiến lược & Quan hệ nhà đầu tư' : 'CEO & Product Lead - Strategic Management & Investor Relations' },
  { name: 'Lương Hoàng Bửu Ngọc', mssv: '255146242', email: 'ngoclhb25@uef.edu.vn', role: lang === 'vi' ? 'CMO & Growth Lead - Marketing, Truyền thông & Tăng trưởng' : 'CMO & Growth Lead - Marketing, Communications & Growth' },
  { name: 'Nguyễn Thị Thanh Hằng', mssv: '235087692', email: 'hangntt23@uef.edu.vn', role: lang === 'vi' ? 'CFO & Operations Lead - Tài chính, Vận hành & Pháp lý' : 'CFO & Operations Lead - Finance, Operations & Legal' },
  { name: 'Nguyễn Quang Tú', mssv: '255015965', email: 'tunq25@uef.edu.vn', role: lang === 'vi' ? 'Xây dựng hệ thống' : 'System Builder' },
];

const getFinancialProjects = (lang: 'vi' | 'en') => [
  {
    year: '2026',
    revenue: 827820000,
    expenses: 1016000000,
    netProfit: -188180000,
    margin: '-22.7%',
    partners: 200,
    mau: 1500,
    details: {
      staff: lang === 'vi' ? '540,000,000đ (Nhân sự)' : '540,000,000 VND (Staff)',
      tech: lang === 'vi' ? '48,000,000đ (Hosting/API/Infra)' : '48,000,000 VND (Hosting/API/Infra)',
      marketing: lang === 'vi' ? '300,000,000đ (Marketing & Acquisition)' : '300,000,000 VND (Marketing & Acquisition)',
      operations: lang === 'vi' ? '120,000,000đ (Văn phòng/Pháp lý)' : '120,000,000 VND (Office/Legal)',
      loan: lang === 'vi' ? '8,000,000đ (Lãi vay)' : '8,000,000 VND (Loan Interest)'
    }
  },
  {
    year: '2027',
    revenue: 2603460000,
    expenses: 1748000000,
    netProfit: 684368000,
    margin: '26.3%',
    partners: 600,
    mau: 8000,
    details: {
      staff: lang === 'vi' ? '960,000,000đ (Nhân sự)' : '960,000,000 VND (Staff)',
      tech: lang === 'vi' ? '120,000,000đ (Hosting/API/Infra)' : '120,000,000 VND (Hosting/API/Infra)',
      marketing: lang === 'vi' ? '480,000,000đ (Marketing & Acquisition)' : '480,000,000 VND (Marketing & Acquisition)',
      operations: lang === 'vi' ? '180,000,000đ (Văn phòng/Pháp lý)' : '180,000,000 VND (Office/Legal)',
      loan: lang === 'vi' ? '8,000,000đ (Lãi vay)' : '8,000,000 VND (Loan Interest)'
    }
  },
  {
    year: '2028',
    revenue: 7008650000,
    expenses: 3186000000,
    netProfit: 3058120000,
    margin: '43.6%',
    partners: 1500,
    mau: 28000,
    details: {
      staff: lang === 'vi' ? '1,800,000,000đ (Nhân sự)' : '1,800,000,000 VND (Staff)',
      tech: lang === 'vi' ? '360,000,000đ (Hosting/API/Infra)' : '360,000,000 VND (Hosting/API/Infra)',
      marketing: lang === 'vi' ? '720,000,000đ (Marketing & Acquisition)' : '720,000,000 VND (Marketing & Acquisition)',
      operations: lang === 'vi' ? '300,000,000đ (Văn phòng/Pháp lý)' : '300,000,000 VND (Office/Legal)',
      loan: lang === 'vi' ? '6,000,000đ (Lãi vay)' : '6,000,000 VND (Loan Interest)'
    }
  },
  {
    year: '2029',
    revenue: 17086850000,
    expenses: 5284000000,
    netProfit: 9442280000,
    margin: '55.3%',
    partners: 3500,
    mau: 70000,
    details: {
      staff: lang === 'vi' ? '3,000,000,000đ (Nhân sự)' : '3,000,000,000 VND (Staff)',
      tech: lang === 'vi' ? '600,000,000đ (Hosting/API/Infra)' : '600,000,000 VND (Hosting/API/Infra)',
      marketing: lang === 'vi' ? '1,200,000,000đ (Marketing & Acquisition)' : '1,200,000,000 VND (Marketing & Acquisition)',
      operations: lang === 'vi' ? '480,000,000đ (Văn phòng/Pháp lý)' : '480,000,000 VND (Office/Legal)',
      loan: lang === 'vi' ? '4,000,000đ (Lãi vay)' : '4,000,000 VND (Loan Interest)'
    }
  },
  {
    year: '2030',
    revenue: 31034600000,
    expenses: 8220000000,
    netProfit: 18251680000,
    margin: '58.8%',
    partners: 6000,
    mau: 140000,
    details: {
      staff: lang === 'vi' ? '4,800,000,000đ (Nhân sự)' : '4,800,000,000 VND (Staff)',
      tech: lang === 'vi' ? '900,000,000đ (Hosting/API/Infra)' : '900,000,000 VND (Hosting/API/Infra)',
      marketing: lang === 'vi' ? '1,800,000,000đ (Marketing & Acquisition)' : '1,800,000,000 VND (Marketing & Acquisition)',
      operations: lang === 'vi' ? '720,000,000đ (Văn phòng/Pháp lý)' : '720,000,000 VND (Office/Legal)',
      loan: lang === 'vi' ? '0đ' : '0 VND'
    }
  }
];

const getSections = (lang: 'vi' | 'en') => [
  { id: 'tong-quan', name: lang === 'vi' ? '1. Mô tả & Slogan' : '1. Description & Slogan', icon: Sparkles },
  { id: 'su-can-thiet', name: lang === 'vi' ? '2. Sự cần thiết & Thực trạng' : '2. Necessity & Market Status', icon: AlertTriangle },
  { id: 'tinh-kha-thi', name: lang === 'vi' ? '3. Tính khả thi & Vận hành' : '3. Feasibility & Operations', icon: Target },
  { id: 'quy-trinh', name: lang === 'vi' ? '4. Quy trình vận hành' : '4. Operating Flow', icon: GitBranch },
  { id: 'sanh-tao', name: lang === 'vi' ? '5. Độc đáo & Sáng tạo' : '5. Uniqueness & AI Pricing', icon: Cpu },
  { id: 'canh-tranh', name: lang === 'vi' ? '6. Phân tích cạnh tranh' : '6. Competitive Analysis', icon: Swords },
  { id: 'rui-ro', name: lang === 'vi' ? '7. Đánh giá & Kiểm soát Rủi ro' : '7. Risk Analysis & Mitigation', icon: ShieldCheck },
  { id: 'ke-hoach', name: lang === 'vi' ? '8. Kế hoạch & Dự phóng' : '8. Plan & Projections', icon: LineChart },
  { id: 'tac-dong', name: lang === 'vi' ? '9. Tác động ESG' : '9. ESG Impact', icon: LeafyGreen },
  { id: 'nguon-luc', name: lang === 'vi' ? '10. Nguồn lực thực hiện' : '10. Resources & Partners', icon: Users },
  { id: 'truyen-thong', name: lang === 'vi' ? '11. Kênh truyền thông' : '11. Marketing Channels', icon: Briefcase },
  { id: 'doi-moi', name: lang === 'vi' ? '12. Đổi mới sáng tạo & KHCN' : '12. Innovation & Tech', icon: Sparkles }
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

            {/* Platform Preview Banner */}
            <div className="mt-10 relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl group">
              <img
                src="/banner.png"
                alt="F.R.E.S.H Platform Preview"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ aspectRatio: '1200/630' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/60 via-transparent to-transparent pointer-events-none" />
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

            {/* PESTEL ANALYSIS */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  {lang === 'vi' ? 'Phân tích PESTEL' : 'PESTEL Analysis'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { letter: 'P', label: lang === 'vi' ? 'Chính trị' : 'Political', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5', desc: lang === 'vi' ? 'Chính phủ ban hành Luật Bảo vệ Môi trường 2022, Nghị định 08/2022 về giảm phát thải. Chiến lược Quốc gia về Kinh tế Tuần hoàn đến 2045 hỗ trợ mạnh các doanh nghiệp xanh.' : 'Government issued Environmental Protection Law 2022, Decree 08/2022 on emission reduction. National Circular Economy Strategy to 2045 supports green businesses.' },
                  { letter: 'E', label: lang === 'vi' ? 'Kinh tế' : 'Economic', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', desc: lang === 'vi' ? 'Lạm phát khiến nhu cầu tiết kiệm tăng cao, đặc biệt ở Gen Z. GDP bình quân đầu người tăng nhưng chi tiêu F&B vẫn chiếm 35% thu nhập. Giảm giá 30-70% là lợi thế cạnh tranh cốt lõi.' : 'Inflation drives demand for savings, especially among Gen Z. Per capita GDP rises but F&B spending remains 35% of income. 30-70% discounts are core competitive advantage.' },
                  { letter: 'S', label: lang === 'vi' ? 'Xã hội' : 'Social', color: 'text-orange-400 border-orange-500/20 bg-orange-500/5', desc: lang === 'vi' ? '25,4 triệu Gen Z tại Việt Nam (26% dân số). 73% sẵn sàng chi thêm cho sản phẩm bền vững (Nielsen 2023). Xu hướng "sống xanh" và tiêu dùng có trách nhiệm đang lan rộng.' : '25.4M Gen Z in Vietnam (26% population). 73% willing to pay more for sustainable products (Nielsen 2023). "Green living" and responsible consumption trends expanding.' },
                  { letter: 'T', label: lang === 'vi' ? 'Công nghệ' : 'Technological', color: 'text-purple-400 border-purple-500/20 bg-purple-500/5', desc: lang === 'vi' ? 'AI/ML phát triển mạnh cho Dynamic Pricing. Mobile-first (78% internet qua smartphone). GS1 QR Code chuẩn quốc tế cho truy xuất nguồn gốc sản phẩm.' : 'AI/ML advancing rapidly for Dynamic Pricing. Mobile-first (78% internet via smartphone). GS1 QR Code international standard for product traceability.' },
                  { letter: 'E', label: lang === 'vi' ? 'Môi trường' : 'Environmental', color: 'text-green-400 border-green-500/20 bg-green-500/5', desc: lang === 'vi' ? 'Việt Nam xếp hạng 6 thế giới về ô nhiễm nhựa đại dương. 8,85 triệu tấn thực phẩm bị lãng phí/năm, tạo 6% tổng phát thải CO2 toàn cầu. Áp lực ESG ngày càng tăng.' : 'Vietnam ranks 6th globally for ocean plastic pollution. 8.85M tons of food wasted/year, causing 6% of global CO2 emissions. ESG pressure increasing.' },
                  { letter: 'L', label: lang === 'vi' ? 'Pháp lý' : 'Legal', color: 'text-red-400 border-red-500/20 bg-red-500/5', desc: lang === 'vi' ? 'Luật An toàn Thực phẩm cho phép bán sản phẩm cận HSD nếu còn trong hạn. Luật Bảo vệ Dữ liệu Cá nhân 2023 yêu cầu bảo mật thông tin người dùng. Không có rào cản pháp lý đáng kể.' : 'Food Safety Law allows selling near-expiry products while still within date. Personal Data Protection Law 2023 requires user data security. No significant legal barriers.' }
                ].map((item, idx) => (
                  <div key={idx} className={`${item.color} border rounded-2xl p-4 space-y-2`}>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center font-black text-xs">{item.letter}</span>
                      <span className="font-black text-xs uppercase">{item.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CUSTOMER PERSONAS */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  {lang === 'vi' ? 'Chân dung Khách hàng (Personas)' : 'Customer Personas'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-blue-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🎓</span>
                    <div>
                      <h4 className="font-black text-blue-400 text-sm">{lang === 'vi' ? 'An — Sinh viên' : 'An — Student'}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">{lang === 'vi' ? '20 tuổi · SV năm 3 · TP.HCM' : '20 y/o · 3rd year · HCMC'}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 font-semibold">
                    <p>💰 {lang === 'vi' ? 'Thu nhập: 3-5 triệu/tháng (bố mẹ + part-time)' : 'Income: 3-5M/month (family + part-time)'}</p>
                    <p>😤 {lang === 'vi' ? 'Pain: Cuối tháng hết tiền, muốn ăn ngon giá rẻ' : 'Pain: End of month broke, wants good food cheap'}</p>
                    <p>🎯 {lang === 'vi' ? 'Mong muốn: Ăn ngon, tiết kiệm, sống xanh để flex' : 'Want: Good food, savings, green living to flex'}</p>
                    <p>📱 {lang === 'vi' ? 'Hành vi: Dùng app 2-3 lần/tuần, thích gamification' : 'Behavior: Uses app 2-3x/week, loves gamification'}</p>
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏪</span>
                    <div>
                      <h4 className="font-black text-emerald-400 text-sm">{lang === 'vi' ? 'Chị Lan — Chủ tiệm bánh' : 'Ms. Lan — Bakery Owner'}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">{lang === 'vi' ? '35 tuổi · Quận 3 · 2 nhân viên' : '35 y/o · District 3 · 2 staff'}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 font-semibold">
                    <p>💰 {lang === 'vi' ? 'Doanh thu: 30-50 triệu/tháng' : 'Revenue: 30-50M/month'}</p>
                    <p>😤 {lang === 'vi' ? 'Pain: Cuối ngày vứt 15-20% NVL, xót tiền' : 'Pain: Throws away 15-20% materials daily, wasteful'}</p>
                    <p>🎯 {lang === 'vi' ? 'Mong muốn: Thu hồi chi phí, thêm khách mới' : 'Want: Recover costs, attract new customers'}</p>
                    <p>📱 {lang === 'vi' ? 'Hành vi: Đăng hàng cuối ngày từ điện thoại' : 'Behavior: Lists items end of day from phone'}</p>
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-orange-500/20 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">👩‍💼</span>
                    <div>
                      <h4 className="font-black text-orange-400 text-sm">{lang === 'vi' ? 'Minh — Nhân viên VP' : 'Minh — Office Worker'}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">{lang === 'vi' ? '28 tuổi · Quận 1 · Lương 12-15tr' : '28 y/o · District 1 · Salary 12-15M'}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-400 font-semibold">
                    <p>💰 {lang === 'vi' ? 'Chi tiêu F&B: 4-6 triệu/tháng' : 'F&B spending: 4-6M/month'}</p>
                    <p>😤 {lang === 'vi' ? 'Pain: Quan tâm môi trường nhưng không biết bắt đầu từ đâu' : 'Pain: Cares about environment but doesn\'t know where to start'}</p>
                    <p>🎯 {lang === 'vi' ? 'Mong muốn: Tiện lợi, chất lượng, đóng góp xã hội' : 'Want: Convenience, quality, social contribution'}</p>
                    <p>📱 {lang === 'vi' ? 'Hành vi: Dùng app trưa/chiều, thích khuyến mãi flash' : 'Behavior: Uses app noon/afternoon, likes flash deals'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TAM / SAM / SOM */}
            <div className="bg-gradient-to-br from-slate-950 to-[#0e1628] border border-emerald-500/20 rounded-3xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  {lang === 'vi' ? 'Quy mô Thị trường — TAM / SAM / SOM' : 'Market Size — TAM / SAM / SOM'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-500/30 flex items-center justify-center">
                    <span className="text-lg font-black text-blue-400">TAM</span>
                  </div>
                  <h4 className="font-black text-white text-xs uppercase">{lang === 'vi' ? 'Tổng thị trường' : 'Total Addressable Market'}</h4>
                  <p className="text-2xl font-black text-blue-400">$2.84B</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {lang === 'vi'
                      ? 'Thị trường F&B Việt Nam 2024: ~640.000 cơ sở F&B. Giá trị hàng tồn cận date ước tính $2,84 tỷ/năm (UNEP, FAO 2023).'
                      : 'Vietnam F&B market 2024: ~640,000 F&B establishments. Near-expiry inventory value est. $2.84B/year (UNEP, FAO 2023).'}
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                    <span className="text-lg font-black text-emerald-400">SAM</span>
                  </div>
                  <h4 className="font-black text-white text-xs uppercase">{lang === 'vi' ? 'Thị trường khả dụng' : 'Serviceable Available Market'}</h4>
                  <p className="text-2xl font-black text-emerald-400">$320M</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {lang === 'vi'
                      ? 'Long-tail F&B tại TP.HCM & Hà Nội: ~72.000 tiệm nhỏ (bakery, trà sữa, quán ăn). Phân khúc này chiếm 15-20% giá trị tồn kho cận date.'
                      : 'Long-tail F&B in HCMC & Hanoi: ~72,000 small shops (bakeries, bubble tea, eateries). This segment accounts for 15-20% of near-expiry inventory value.'}
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-orange-500/20 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-orange-500/30 flex items-center justify-center">
                    <span className="text-lg font-black text-orange-400">SOM</span>
                  </div>
                  <h4 className="font-black text-white text-xs uppercase">{lang === 'vi' ? 'Thị trường mục tiêu' : 'Serviceable Obtainable Market'}</h4>
                  <p className="text-2xl font-black text-orange-400">$4.8M</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {lang === 'vi'
                      ? 'Năm 1 (2026): 150 tiệm đối tác × 15 giao dịch/ngày × 40.000đ/đơn × 365 ngày. Hoa hồng 15% = ~$4,8 triệu doanh thu thực.'
                      : 'Year 1 (2026): 150 partner shops × 15 transactions/day × 40,000 VND/order × 365 days. 15% commission = ~$4.8M actual revenue.'}
                  </p>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-black flex items-center justify-center text-xs">0</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('phase_0_title')}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {t('phase_0_desc')}
                  </p>
                </div>
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center text-xs">1</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('phase_1_title')}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {t('phase_1_desc')}
                  </p>
                </div>
                <div className="bg-slate-950/80 border border-blue-500/20 rounded-2xl p-5 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-black flex items-center justify-center text-xs">2</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('phase_2_title')}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {t('phase_2_desc')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* BUSINESS MODEL CANVAS */}
          <section className="space-y-6 pt-4">
            <div className="bg-gradient-to-br from-slate-950 to-[#0e1628] border border-emerald-500/20 rounded-3xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  Business Model Canvas
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { title: lang === 'vi' ? 'Đối tác chính' : 'Key Partners', color: 'border-blue-500/20', items: lang === 'vi' ? ['Long-tail F&B (tiệm bánh, trà sữa, quán ăn)', 'UEF & các trường ĐH', 'GS1 Việt Nam (mã QR)', 'Đối tác thanh toán (MoMo, VNPay)'] : ['Long-tail F&B shops', 'UEF & universities', 'GS1 Vietnam (QR codes)', 'Payment partners (MoMo, VNPay)'] },
                  { title: lang === 'vi' ? 'Hoạt động chính' : 'Key Activities', color: 'border-emerald-500/20', items: lang === 'vi' ? ['Phát triển AI Dynamic Pricing', 'Onboarding đối tác F&B', 'Vận hành nền tảng & UX', 'Gamification & Green Credit'] : ['AI Dynamic Pricing development', 'F&B partner onboarding', 'Platform operations & UX', 'Gamification & Green Credit'] },
                  { title: lang === 'vi' ? 'Giải pháp giá trị' : 'Value Proposition', color: 'border-orange-500/20', items: lang === 'vi' ? ['B2B: Thu hồi 30-50% chi phí NVL', 'B2C: Tiết kiệm 30-70% chi tiêu', 'ESG: Giảm CO2 đo lường được', 'Transparent Clearance (không túi mù)'] : ['B2B: Recover 30-50% material costs', 'B2C: Save 30-70% on spending', 'ESG: Measurable CO2 reduction', 'Transparent Clearance (no blind bags)'] },
                  { title: lang === 'vi' ? 'Quan hệ KH' : 'Customer Relations', color: 'border-purple-500/20', items: lang === 'vi' ? ['App self-service', 'Push notification cá nhân hóa', 'Leaderboard & cộng đồng', 'Dashboard ESG cho B2B'] : ['App self-service', 'Personalized push notifications', 'Leaderboard & community', 'ESG Dashboard for B2B'] },
                  { title: lang === 'vi' ? 'Phân khúc KH' : 'Customer Segments', color: 'border-red-500/20', items: lang === 'vi' ? ['SV & Gen Z (18-28 tuổi)', 'Nhân viên VP (25-35)', 'Chủ tiệm F&B nhỏ', 'Chuỗi F&B vừa (GĐ2)'] : ['Students & Gen Z (18-28)', 'Office workers (25-35)', 'Small F&B shop owners', 'Mid-size F&B chains (Phase 2)'] },
                  { title: lang === 'vi' ? 'Nguồn lực chính' : 'Key Resources', color: 'border-cyan-500/20', items: lang === 'vi' ? ['AI/ML engine & data moat', 'Đội ngũ founder UEF', 'Mạng lưới đối tác F&B', 'Hạ tầng cloud (Vercel, Supabase)'] : ['AI/ML engine & data moat', 'UEF founder team', 'F&B partner network', 'Cloud infra (Vercel, Supabase)'] },
                  { title: lang === 'vi' ? 'Kênh phân phối' : 'Channels', color: 'border-amber-500/20', items: lang === 'vi' ? ['App mobile (iOS/Android)', 'Website PWA', 'TikTok & Instagram', 'KOC/KOL campus'] : ['Mobile app (iOS/Android)', 'PWA website', 'TikTok & Instagram', 'Campus KOC/KOL'] },
                  { title: lang === 'vi' ? 'Cấu trúc chi phí' : 'Cost Structure', color: 'border-pink-500/20', items: lang === 'vi' ? ['Phát triển công nghệ (40%)', 'Marketing & Acquisition (30%)', 'Nhân sự & vận hành (20%)', 'VP & pháp lý (10%)'] : ['Tech development (40%)', 'Marketing & Acquisition (30%)', 'HR & Operations (20%)', 'Office & Legal (10%)'] },
                  { title: lang === 'vi' ? 'Dòng doanh thu' : 'Revenue Streams', color: 'border-green-500/20', items: lang === 'vi' ? ['Hoa hồng giao dịch 15%', 'SaaS Insights (B2B)', 'Green Credit sponsorship', 'Quảng cáo vị trí ưu tiên'] : ['15% transaction commission', 'SaaS Insights (B2B)', 'Green Credit sponsorship', 'Priority placement ads'] }
                ].map((block, idx) => (
                  <div key={idx} className={`bg-slate-900/60 border ${block.color} rounded-2xl p-4 space-y-2`}>
                    <h4 className="font-black text-white text-[10px] uppercase tracking-wider">{block.title}</h4>
                    <ul className="text-[10px] text-slate-400 space-y-1 font-semibold">
                      {block.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION: QUY TRINH VAN HANH (6-step flow) */}
          <section id="quy-trinh" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">{t('sec_operating')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { num: '1', title: t('op_step1'), desc: t('op_step1_desc') },
                  { num: '2', title: t('op_step2'), desc: t('op_step2_desc') },
                  { num: '3', title: t('op_step3'), desc: t('op_step3_desc') },
                  { num: '4', title: t('op_step4'), desc: t('op_step4_desc') },
                  { num: '5', title: t('op_step5'), desc: t('op_step5_desc') },
                  { num: '6', title: t('op_step6'), desc: t('op_step6_desc') },
                ].map((step, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-lg shadow-emerald-500/20">
                      {step.num}
                    </div>
                    <h4 className="font-black text-white text-xs uppercase tracking-wider mt-2">{step.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">{step.desc}</p>
                  </div>
                ))}
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

            {/* TRANSPARENT CLEARANCE */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  {lang === 'vi' ? 'Transparent Clearance — Lý do không dùng mô hình Túi mù' : 'Transparent Clearance — Why Not Blind Bags'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {lang === 'vi'
                  ? 'Nghiên cứu trên nền tảng Wolt (Stockholm) cho thấy minh bạch hóa thông tin thực phẩm cận date giúp giảm tỷ lệ lãng phí từ 33,06% xuống 14,8%. Nghiên cứu của UCSD cũng xác nhận khi người mua biết rõ mình đang mua gì, tỷ lệ thực phẩm bị vứt bỏ sau khi mua về giảm đáng kể so với mô hình túi mù.'
                  : 'Research on Wolt platform (Stockholm) shows transparent near-expiry food information reduces waste rate from 33.06% to 14.8%. UCSD studies confirm that when buyers know exactly what they are purchasing, post-purchase food waste drops significantly compared to blind bag models.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 space-y-2">
                  <h4 className="font-black text-red-400 text-xs uppercase">❌ {lang === 'vi' ? 'Surprise Clearance (Túi mù)' : 'Surprise Clearance (Blind Bags)'}</h4>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 font-semibold">
                    <li>• {lang === 'vi' ? 'Không biết sản phẩm trước khi mua' : 'Unknown products before purchase'}</li>
                    <li>• {lang === 'vi' ? 'Nguy cơ lãng phí thứ cấp tại hộ gia đình' : 'Secondary waste risk at household level'}</li>
                    <li>• {lang === 'vi' ? 'Dữ liệu nhị phân (bán/không bán) — không đủ cho AI' : 'Binary data (sold/unsold) — insufficient for AI'}</li>
                    <li>• {lang === 'vi' ? 'Không phù hợp văn hóa tiêu dùng Việt Nam' : 'Not suitable for Vietnamese consumer culture'}</li>
                  </ul>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                  <h4 className="font-black text-emerald-400 text-xs uppercase">✅ {lang === 'vi' ? 'Transparent Clearance (F.R.E.S.H)' : 'Transparent Clearance (F.R.E.S.H)'}</h4>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 font-semibold">
                    <li>• {lang === 'vi' ? 'Hiển thị đầy đủ: ảnh thực, thành phần, HSD, mức giảm' : 'Full display: real photos, ingredients, expiry, discount'}</li>
                    <li>• {lang === 'vi' ? 'Người mua chỉ chọn đúng món cần — giảm lãng phí' : 'Buyers choose exactly what they need — reduces waste'}</li>
                    <li>• {lang === 'vi' ? 'Dữ liệu phong phú theo từng sản phẩm → nuôi AI' : 'Rich per-product data → feeds AI engine'}</li>
                    <li>• {lang === 'vi' ? 'Phù hợp cao với tâm lý tiêu dùng Việt' : 'Highly compatible with Vietnamese consumer mindset'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* VALUE PROPOSITION */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="font-black text-white text-sm uppercase tracking-wider">
                {lang === 'vi' ? 'Đề xuất Giá trị theo từng Phân khúc' : 'Value Proposition by Segment'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
                  <span className="text-2xl">🏪</span>
                  <h4 className="font-black text-emerald-400 text-xs uppercase">{lang === 'vi' ? 'Long-tail F&B (B2B)' : 'Long-tail F&B (B2B)'}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    {lang === 'vi'
                      ? 'Thu hồi 30-50% chi phí NVL từ hàng sẽ bỏ đi. Marketing zero-cost đến tệp Gen Z. Báo cáo tồn kho & ESG. Đăng hàng dưới 2 phút từ điện thoại.'
                      : 'Recover 30-50% material costs from would-be waste. Zero-cost Gen Z marketing. Inventory & ESG reports. List products in under 2 mins from phone.'}
                  </p>
                </div>
                <div className="bg-slate-950/80 border border-blue-500/20 rounded-2xl p-5 space-y-2">
                  <span className="text-2xl">🎓</span>
                  <h4 className="font-black text-blue-400 text-xs uppercase">{lang === 'vi' ? 'Sinh viên & Gen Z (B2C)' : 'Students & Gen Z (B2C)'}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    {lang === 'vi'
                      ? 'Tiết kiệm 30-70% so với giá gốc. Sản phẩm minh bạch (ảnh thật, HSD rõ). Hyper-local bán kính 500m. Green Credit & Waste Warriors Leaderboard.'
                      : 'Save 30-70% off original price. Transparent products (real photos, clear expiry). Hyper-local 500m radius. Green Credit & Waste Warriors Leaderboard.'}
                  </p>
                </div>
                <div className="bg-slate-950/80 border border-orange-500/20 rounded-2xl p-5 space-y-2">
                  <span className="text-2xl">☕</span>
                  <h4 className="font-black text-orange-400 text-xs uppercase">{lang === 'vi' ? 'Chuỗi F&B vừa (B2B – GĐ2)' : 'Mid-size F&B Chains (B2B – Phase 2)'}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    {lang === 'vi'
                      ? 'SaaS Insights: báo cáo tồn kho nâng cao, dự báo nhu cầu theo mùa, phân tích chiến lược markdown. Tích hợp POS API tự động.'
                      : 'SaaS Insights: advanced inventory reports, seasonal demand forecasting, markdown strategy analysis. Automated POS API integration.'}
                  </p>
                </div>
              </div>
            </div>

            {/* GREEN CREDIT SYSTEM */}
            <div className="bg-gradient-to-br from-slate-950 to-[#0e1628] border border-emerald-500/20 rounded-3xl p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-sm uppercase tracking-wider">
                  {lang === 'vi' ? 'Hệ thống Green Credit — Gamification' : 'Green Credit System — Gamification'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {lang === 'vi'
                  ? 'Mỗi giao dịch hoàn tất được tự động quy đổi thành điểm Green Credit dựa trên lượng CO2 tiết kiệm (theo hệ số UNEP). Điểm tích lũy xác định cấp bậc: Đồng → Bạc → Vàng → Kim Cương.'
                  : 'Each completed transaction is automatically converted to Green Credit points based on CO2 saved (using UNEP coefficients). Points determine tier: Bronze → Silver → Gold → Diamond.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">{lang === 'vi' ? 'Giai đoạn 1 (2026)' : 'Phase 1 (2026)'}</span>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    {lang === 'vi'
                      ? 'Đổi điểm lấy voucher tại các tiệm đối tác trong hệ sinh thái F.R.E.S.H. Vòng lặp giá trị khép kín.'
                      : 'Redeem points for vouchers at F.R.E.S.H partner stores. Closed-loop value cycle.'}
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">{lang === 'vi' ? 'Giai đoạn 2 (2027)' : 'Phase 2 (2027)'}</span>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    {lang === 'vi'
                      ? 'MOU với UEF & các trường ĐH: đổi điểm thành ưu đãi học phí, điểm cộng hoạt động xã hội, quyền ưu tiên sự kiện.'
                      : 'MOU with UEF & universities: redeem for tuition discounts, social activity credits, event priority access.'}
                  </p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-wider">{lang === 'vi' ? 'Giai đoạn 3 (2028+)' : 'Phase 3 (2028+)'}</span>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    {lang === 'vi'
                      ? 'Chứng nhận ESG cá nhân được FMCG Brands và tổ chức xanh công nhận trong tuyển dụng & đánh giá ứng viên.'
                      : 'Personal ESG certification recognized by FMCG Brands and green organizations in recruitment & candidate evaluation.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: CANH TRANH - Positioning Map */}
          <section id="canh-tranh" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">{t('comp_vs')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-3 text-slate-400 font-bold uppercase text-[10px]">{t('comp_vs')}</th>
                    <th className="text-center py-3 px-3 text-emerald-400 font-black text-[10px] uppercase">{t('comp_transparency')}</th>
                    <th className="text-center py-3 px-3 text-emerald-400 font-black text-[10px] uppercase">{t('comp_vn_fit')}</th>
                    <th className="text-center py-3 px-3 text-emerald-400 font-black text-[10px] uppercase">{t('comp_longtail')}</th>
                    <th className="text-center py-3 px-3 text-emerald-400 font-black text-[10px] uppercase">{t('comp_gamification')}</th>
                    <th className="text-center py-3 px-3 text-emerald-400 font-black text-[10px] uppercase">{t('comp_ai')}</th>
                    <th className="text-center py-3 px-2 text-emerald-400 font-black text-[10px] uppercase w-12">{t('comp_total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: t('comp_fresh'), scores: [10, 10, 10, 9, 9], isFresh: true },
                    { name: t('comp_tgtg'), scores: [2, 1, 3, 5, 6], isFresh: false },
                    { name: t('comp_flash'), scores: [6, 1, 2, 2, 5], isFresh: false },
                    { name: t('comp_olio'), scores: [8, 1, 1, 4, 2], isFresh: false },
                    { name: t('comp_grab'), scores: [7, 9, 1, 2, 8], isFresh: false },
                    { name: t('comp_fb'), scores: [5, 8, 6, 1, 1], isFresh: false },
                  ].map((row, idx) => {
                    const total = row.scores.reduce((a, b) => a + b, 0);
                    return (
                      <tr key={idx} className={`border-b border-slate-800/60 ${row.isFresh ? 'bg-emerald-500/5' : ''} hover:bg-slate-800/30 transition-colors`}>
                        <td className={`py-3 px-3 font-bold ${row.isFresh ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {row.isFresh && <Leaf className="w-3 h-3 inline mr-1 text-emerald-400" />}
                          {row.name}
                        </td>
                        {row.scores.map((score, si) => (
                          <td key={si} className={`text-center py-3 px-3 ${row.isFresh ? 'font-bold' : 'text-slate-400'}`}>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                              score >= 8 ? 'bg-emerald-500/20 text-emerald-400' :
                              score >= 5 ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>{score}</span>
                          </td>
                        ))}
                        <td className="text-center py-3 px-2">
                          <span className="font-black text-white">{total}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-[9px] text-slate-500 italic mt-3 text-center">
                {lang === 'vi' ? 'Thang điểm /10 cho từng tiêu chí. F.R.E.S.H dẫn đầu 48/50 điểm.' : 'Score /10 per criterion. F.R.E.S.H leads at 48/50.'}
              </div>
            </div>

            {/* COMPETITOR CLASSIFICATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-400" />
                  <h4 className="font-black text-red-400 text-xs uppercase">{lang === 'vi' ? 'Đối thủ Trực tiếp' : 'Direct Competitors'}</h4>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-2 font-semibold">
                  <li><span className="text-red-400 font-bold">Too Good To Go</span> — {lang === 'vi' ? 'Mô hình Surprise Bag (túi mù). Chưa vào VN. Không phù hợp văn hóa Á Đông.' : 'Surprise Bag model. Not in Vietnam. Doesn\'t fit Asian culture.'}</li>
                  <li><span className="text-red-400 font-bold">Flashfood</span> — {lang === 'vi' ? 'Chỉ hợp tác siêu thị lớn (Bắc Mỹ). Không có long-tail F&B.' : 'Only partners with large supermarkets (North America). No long-tail F&B.'}</li>
                  <li><span className="text-red-400 font-bold">OLIO</span> — {lang === 'vi' ? 'P2P sharing. Không có AI pricing. Tập trung UK.' : 'P2P sharing. No AI pricing. UK-focused.'}</li>
                </ul>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h4 className="font-black text-amber-400 text-xs uppercase">{lang === 'vi' ? 'Đối thủ Gián tiếp' : 'Indirect Competitors'}</h4>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-2 font-semibold">
                  <li><span className="text-amber-400 font-bold">GrabFood / ShopeeFood</span> — {lang === 'vi' ? 'Có deal giảm giá nhưng không chuyên cận date. Phí hoa hồng 25-30%.' : 'Has discount deals but not near-expiry focused. 25-30% commission.'}</li>
                  <li><span className="text-amber-400 font-bold">Facebook Groups</span> — {lang === 'vi' ? 'Cộng đồng tự phát nhưng thiếu AI, thanh toán, tracking.' : 'Organic communities but lacks AI, payments, tracking.'}</li>
                </ul>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                  <h4 className="font-black text-purple-400 text-xs uppercase">{lang === 'vi' ? 'Đối thủ Tiềm ẩn' : 'Potential Competitors'}</h4>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-2 font-semibold">
                  <li><span className="text-purple-400 font-bold">{lang === 'vi' ? 'Siêu thị tự làm' : 'Supermarket Self-Service'}</span> — {lang === 'vi' ? 'Co.opmart, Bách Hóa Xanh có thể tự tạo kênh giảm giá cận date riêng.' : 'Co.opmart, Bach Hoa Xanh may create own near-expiry discount channels.'}</li>
                  <li><span className="text-purple-400 font-bold">{lang === 'vi' ? 'Clone startup' : 'Clone Startups'}</span> — {lang === 'vi' ? 'Rào cản: data moat + network effect sau 6-12 tháng hoạt động.' : 'Barrier: data moat + network effect after 6-12 months operation.'}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION: PHAN TICH RUI RO */}
          <section id="rui-ro" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">7. {t('sec_risks')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4 w-1/4">{t('risk_col_name')}</th>
                    <th className="py-3 px-3 text-center w-32">{t('risk_col_level')}</th>
                    <th className="py-3 px-3 text-center w-32">{t('risk_col_prob')}</th>
                    <th className="py-3 px-4">{t('risk_col_mitigation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: t('risk_1_name'), level: t('risk_1_level'), prob: t('risk_1_prob'), mitigation: t('risk_1_mitigation') },
                    { id: 2, name: t('risk_2_name'), level: t('risk_2_level'), prob: t('risk_2_prob'), mitigation: t('risk_2_mitigation') },
                    { id: 3, name: t('risk_3_name'), level: t('risk_3_level'), prob: t('risk_3_prob'), mitigation: t('risk_3_mitigation') },
                    { id: 4, name: t('risk_4_name'), level: t('risk_4_level'), prob: t('risk_4_prob'), mitigation: t('risk_4_mitigation') },
                    { id: 5, name: t('risk_5_name'), level: t('risk_5_level'), prob: t('risk_5_prob'), mitigation: t('risk_5_mitigation') }
                  ].map((row) => (
                    <tr key={row.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-200">
                        {row.id}. {row.name}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          row.level.includes('Rất cao') || row.level.includes('Very High') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          row.level.includes('Cao') || row.level.includes('High') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {row.level}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center text-slate-300 font-bold">
                        {row.prob}
                      </td>
                      <td className="py-4 px-4 text-slate-400 leading-relaxed font-semibold">
                        {row.mitigation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION: KE HOACH & DU PHONG FINANCE */}
          <section id="ke-hoach" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">8. {t('sec_finance')}</h2>
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
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">{t('revenue_label')}</span>
                        <p className="text-xl font-black text-emerald-400">{selectedYearData.revenue.toLocaleString()}đ</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold uppercase">{t('expenses_label')}</span>
                        <p className="text-xl font-black text-orange-400">{selectedYearData.expenses.toLocaleString()}đ</p>
                      </div>
                      <div className="h-px bg-slate-900" />
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase">{t('net_profit_label')}</span>
                        <p className={`text-2xl font-black ${selectedYearData.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {selectedYearData.netProfit >= 0 ? '' : '-'}{Math.abs(selectedYearData.netProfit).toLocaleString()}đ
                        </p>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-2 pt-2 border-t border-slate-900">
                        <span>{t('milestones_title')} m_{selectedYear}_partners: {selectedYearData.partners} {(lang === 'vi' ? 'tiệm' : 'stores')}</span>
                        <span>MAU: {selectedYearData.mau.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('cost_allocation')}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Object.entries(selectedYearData.details).map(([key, val]) => (
                        <div key={key} className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">
                            {key === 'staff' && (lang === 'vi' ? 'Nhân sự' : 'Staff')}
                            {key === 'tech' && 'IT & Cloud Infrastructure'}
                            {key === 'marketing' && (lang === 'vi' ? 'Marketing & Acquisition' : 'Marketing & Acquisition')}
                            {key === 'operations' && (lang === 'vi' ? 'Vận hành & Pháp lý' : 'Operations & Legal')}
                            {key === 'loan' && (lang === 'vi' ? 'Lãi vay' : 'Loan Interest')}
                          </span>
                          <span className="font-bold text-slate-300">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 5-YEAR GROWTH ROADMAP */}
              <div className="space-y-4 pt-4">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('milestones_title')}</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {financialProjects.map((fp) => {
                    const isBreakeven = fp.year === '2027';
                    return (
                      <div
                        key={fp.year}
                        className={`rounded-xl p-3.5 border transition-all text-center relative ${isBreakeven ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-950/80 border-slate-850'}`}
                      >
                        {isBreakeven && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#0b0f19] text-[8px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap">
                            {t('breakeven')}
                          </span>
                        )}
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{fp.year}</p>
                        <p className="text-sm font-black text-white mt-1">
                          {lang === 'vi' ? fp.partners.toLocaleString() + ' tiệm' : fp.partners.toLocaleString() + ' stores'}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">
                          {(fp.revenue / 1000000).toFixed(0)} {(lang === 'vi' ? 'tr' : 'M')}đ
                        </p>
                        <p className={`text-[9px] font-bold mt-0.5 ${fp.netProfit >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {fp.netProfit >= 0 ? '+' : ''}{(fp.netProfit / 1000000).toFixed(0)}{(lang === 'vi' ? 'tr' : 'M')}đ
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: NGUON LUC */}
          <section id="nguon-luc" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">10. {t('sec_resources')}</h2>
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
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">11. {t('sec_channels')}</h2>
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

          {/* SECTION: ESG Impact */}
          <section id="tac-dong" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">9. {t('esg_section')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-5">
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {lang === 'vi'
                  ? 'F.R.E.S.H không chỉ là một mô hình kinh doanh mà còn là một công cụ đo lường tác động xã hội cụ thể. Mỗi giao dịch trên nền tảng đều được gắn với các chỉ số ESG có thể báo cáo được.'
                  : 'F.R.E.S.H is not just a business model but also a concrete social impact measurement tool. Every transaction on the platform is tied to reportable ESG metrics.'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2.5 px-2 text-slate-400 font-bold uppercase text-[10px]">{t('esg_metric')}</th>
                      <th className="text-center py-2.5 px-2 text-emerald-400 font-black text-[10px]">{t('esg_metric_2026')}</th>
                      <th className="text-center py-2.5 px-2 text-emerald-400 font-black text-[10px]">{t('esg_metric_2027')}</th>
                      <th className="text-center py-2.5 px-2 text-emerald-400 font-black text-[10px]">{t('esg_metric_2028')}</th>
                      <th className="text-center py-2.5 px-2 text-emerald-400 font-black text-[10px]">{t('esg_metric_2030')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'food_saved', values: ['46', '138', '345', '1.380'] },
                      { key: 'co2', values: ['69', '207', '518', '2.070'] },
                      { key: 'stores', values: ['200', '600', '1.500', '6.000'] },
                      { key: 'partner_revenue', values: ['8,37', '25,1', '62,8', '251'] },
                      { key: 'user_savings', values: ['~25k', '~30k', '~35k', '~40k'] },
                    ].map((row, idx) => {
                      const labelKey = 'esg_' + row.key;
                      return (
                        <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-2 text-slate-300 font-bold">{t(labelKey as any)}</td>
                          {row.values.map((v, vi) => (
                            <td key={vi} className="text-center py-2.5 px-2 text-white font-bold">{v}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-3 space-y-1">
                <p>
                  {lang === 'vi'
                    ? '(*) Cơ sở tính: Mỗi kg thực phẩm lãng phí phát thải ~1,5 kg CO2e (UNEP Food Waste Index 2021). AOV 45.000đ, trọng lượng TB ~300g/đơn.'
                    : '(*) Basis: Each kg of wasted food emits ~1.5 kg CO2e (UNEP Food Waste Index 2021). AOV 45,000 VND, avg weight ~300g/order.'}
                </p>
                <p>
                  {lang === 'vi'
                    ? 'Các chỉ số này được tích hợp trực tiếp vào dashboard Green Credit của người dùng và báo cáo ESG của đối tác doanh nghiệp.'
                    : 'These metrics are directly integrated into the user Green Credit dashboard and partner ESG reports.'}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: DOI MOI SANG TAO */}
          <section id="doi-moi" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">12. {t('sec_innovation_tech')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8 space-y-6">
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {t('inno_subtitle')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: t('inno_1_title'), desc: t('inno_1_desc'), icon: '🤖' },
                  { title: t('inno_2_title'), desc: t('inno_2_desc'), icon: '📊' },
                  { title: t('inno_3_title'), desc: t('inno_3_desc'), icon: '📱' },
                  { title: t('inno_4_title'), desc: t('inno_4_desc'), icon: '🏆' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-20%] w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex items-start gap-4">
                      <span className="text-3xl p-3 bg-slate-900 rounded-xl">{item.icon}</span>
                      <div className="space-y-2">
                        <h4 className="font-black text-white text-sm uppercase group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
