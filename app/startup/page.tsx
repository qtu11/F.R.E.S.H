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
  { id: 'tong-quan', name: lang === 'vi' ? 'Mô tả & Slogan' : 'Description & Slogan', icon: Sparkles },
  { id: 'su-can-thiet', name: lang === 'vi' ? 'Sự cần thiết & Thực trạng' : 'Necessity & Market Status', icon: AlertTriangle },
  { id: 'tinh-kha-thi', name: lang === 'vi' ? 'Tính khả thi & Vận hành' : 'Feasibility & Operations', icon: Target },
  { id: 'quy-trinh', name: lang === 'vi' ? 'Quy trình vận hành' : 'Operating Flow', icon: GitBranch },
  { id: 'sanh-tao', name: lang === 'vi' ? 'Độc đáo & Sáng tạo' : 'Uniqueness & AI Pricing', icon: Cpu },
  { id: 'canh-tranh', name: lang === 'vi' ? 'Phân tích cạnh tranh' : 'Competitive Analysis', icon: Swords },
  { id: 'ke-hoach', name: lang === 'vi' ? 'Kế hoạch & Dự phóng' : 'Plan & Projections', icon: LineChart },
  { id: 'esg', name: lang === 'vi' ? 'Tác động ESG' : 'ESG Impact', icon: LeafyGreen },
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

          {/* SECTION: ESG Impact */}
          <section id="tac-dong" className="space-y-6 pt-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">{t('esg_section')}</h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-950/80 border border-emerald-800/40 rounded-2xl p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('esg_e_title')}</h4>
                  <ul className="space-y-2 text-xs text-slate-400 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0" />
                      {t('esg_e_1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0" />
                      {t('esg_e_2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0" />
                      {t('esg_e_3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 shrink-0" />
                      {t('esg_e_4')}
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-950/80 border border-blue-800/40 rounded-2xl p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('esg_s_title')}</h4>
                  <ul className="space-y-2 text-xs text-slate-400 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                      {t('esg_s_1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                      {t('esg_s_2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                      {t('esg_s_3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                      {t('esg_s_4')}
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-950/80 border border-amber-800/40 rounded-2xl p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wider">{t('esg_g_title')}</h4>
                  <ul className="space-y-2 text-xs text-slate-400 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" />
                      {t('esg_g_1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" />
                      {t('esg_g_2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" />
                      {t('esg_g_3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 shrink-0" />
                      {t('esg_g_4')}
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
