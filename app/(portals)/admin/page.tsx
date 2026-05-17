'use client';

import { useState, useEffect } from 'react';
import { Menu, TrendingUp, Globe, RefreshCw, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import {
  staggerContainer, staggerItem, fadeUp, scaleIn,
  cardHover, buttonTap, useSafeReducedMotion,
} from '@/lib/animation';

export default function AdminApp() {
  const { t } = useGlobal();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const reduced = useSafeReducedMotion();

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: t('total_food_rescued'), value: '1,500 kg', change: '+12%', color: 'text-emerald-600', icon: '🍃' },
    { label: t('total_co2_reduced'), value: '5,400 kg', change: '+8%', color: 'text-blue-600', icon: '🌍' },
    { label: 'Active Partners', value: '1,240', change: '+5%', color: 'text-orange-600', icon: '🏪' },
    { label: 'Orders Today', value: '892', change: '+15%', color: 'text-purple-600', icon: '📦' },
  ];

  const districts = [
    { name: 'District 1', pct: 95, color: 'bg-emerald-500' },
    { name: 'District 7', pct: 80, color: 'bg-emerald-400' },
    { name: 'District 2', pct: 65, color: 'bg-emerald-500' },
    { name: 'Binh Thanh', pct: 50, color: 'bg-emerald-400' },
    { name: 'Tan Binh', pct: 35, color: 'bg-emerald-500' },
  ];

  const logLines = [
    { text: '[INFO] AI Engine: Online | Load: 42%', color: 'text-emerald-400' },
    { text: '[INFO] Database Cluster: Healthy | 12ms', color: 'text-emerald-400' },
    { text: '[WARN] CDN Edge: High Load | 120ms', color: 'text-yellow-400' },
    { text: '[DEBUG] Fraud Scanner: 15.4k tx processed', color: 'text-blue-400' },
    { text: '[INFO] ESG Report: Auto-generated daily', color: 'text-emerald-400' },
  ];

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <motion.div variants={fadeUp} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
        className="bg-gradient-to-br from-[#057A42] to-emerald-800 dark:from-emerald-900 dark:to-slate-900 pt-12 pb-6 px-4 md:rounded-b-[40px] shadow-lg transition-colors"
      >
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white hover:bg-white/10 p-1 rounded transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <motion.div initial={reduced ? {} : { x: -20, opacity: 0 }} animate={reduced ? {} : { x: 0, opacity: 1 }} className="text-white font-bold text-lg tracking-wide uppercase">
              {t('admin_console')}
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-3 text-white/60 text-xs font-mono"
          >
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            {mounted ? time : ''}
          </motion.div>
        </div>
      </motion.div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 mt-4">
        <motion.div variants={staggerContainer} initial="hidden" animate={mounted ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={staggerItem} whileHover={reduced ? {} : { y: -6, scale: 1.02 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</div>
                <motion.span initial={reduced ? {} : { scale: 0 }} animate={reduced ? {} : { scale: 1 }} transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 12 }}
                  className="text-lg"
                >
                  {stat.icon}
                </motion.span>
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1"
              >
                <span className="text-[9px]">▲</span> {stat.change} vs yesterday
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={scaleIn} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-black dark:text-white font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-5 text-[#057A42]" /> {t('network_co2')}
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded-md font-mono">Last 6 months</span>
            </div>
            <div className="relative h-48">
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[10px] text-gray-400 dark:text-slate-500 font-bold items-end pr-2">
                <span>600</span><span>400</span><span>200</span><span>0</span>
              </div>
              <div className="absolute left-8 right-4 top-0 bottom-8 border-l border-b border-gray-200 dark:border-slate-700">
                <motion.svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none"
                  initial={reduced ? {} : { opacity: 0 }} animate={reduced ? {} : { opacity: 1 }} transition={{ duration: 0.8 }}
                >
                  <motion.path d="M 0 80 L 15 70 L 30 65 L 45 50 L 60 35 L 75 25 L 100 10" fill="none" stroke="#057A42" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="drop-shadow-lg"
                    initial={reduced ? {} : { pathLength: 0 }} animate={reduced ? {} : { pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
                  />
                  <path d="M 0 80 L 15 70 L 30 65 L 45 50 L 60 35 L 75 25 L 100 10 L 100 100 L 0 100 Z" fill="url(#gradient)" opacity="0.3" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#057A42" />
                      <stop offset="100%" stopColor="#057A42" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </motion.svg>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute left-[45%] top-[50%] w-3 h-3 bg-[#057A42] rounded-full shadow-[0_0_10px_rgba(5,122,66,0.5)] animate-ping" style={{ animationDuration: '2s' }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={scaleIn}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
          >
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
              <Globe className="w-4 h-5 text-[#057A42]" /> {t('growth_district')}
            </h3>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
              {districts.map((d, i) => (
                <motion.div key={i} variants={staggerItem} className="space-y-1 group">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-slate-300">{d.name}</span>
                    <span className="font-bold text-[#057A42] dark:text-emerald-400">{d.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                      className={`${d.color} h-full rounded-full group-hover:brightness-110 transition-all`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={scaleIn}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
          >
            <h3 className="text-black dark:text-white font-extrabold text-xs uppercase tracking-wide mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-5 text-[#057A42]" /> {t('dynamic_pricing_perf')}
            </h3>
            <div className="relative h-40 ml-10">
              <div className="absolute -left-10 top-0 bottom-0 w-8 flex flex-col justify-between text-[9px] text-gray-400 dark:text-slate-500 font-bold items-end pr-2">
                <span>1200</span><span>800</span><span>400</span><span>0</span>
              </div>
              <div className="absolute left-0 right-0 top-0 bottom-0 border-l border-b border-gray-200 dark:border-slate-700 flex items-end justify-around px-1 gap-1">
                {[
                  { h1: '60%', h2: '40%' },
                  { h1: '80%', h2: '30%' },
                  { h1: '90%', h2: '50%' },
                  { h1: '70%', h2: '60%' },
                  { h1: '85%', h2: '45%' },
                  { h1: '75%', h2: '55%' },
                ].map((bar, i) => (
                  <div key={i} className="w-full flex items-end gap-[2px] h-full pt-4 group">
                    <motion.div initial={{ height: 0 }} animate={{ height: bar.h1 }} transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      className="w-1/2 bg-[#057A42] rounded-t-sm group-hover:brightness-110 transition-all" />
                    <motion.div initial={{ height: 0 }} animate={{ height: bar.h2 }} transition={{ duration: 0.8, delay: i * 0.1 + 0.1, ease: 'easeOut' }}
                      className="w-1/2 bg-[#ff8c00] rounded-t-sm group-hover:brightness-110 transition-all" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-gray-500"><div className="w-2 h-2 rounded-full bg-[#057A42]" /> AI Price</span>
              <span className="flex items-center gap-1.5 text-gray-500"><div className="w-2 h-2 rounded-full bg-[#ff8c00]" /> Fixed</span>
            </div>
          </motion.div>

          <motion.div variants={scaleIn}
            className="bg-gray-800 dark:bg-slate-900 rounded-3xl p-6 shadow-inner border border-gray-700 dark:border-slate-800 font-mono text-xs"
          >
            <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-emerald-500" /> {t('system_logs')}
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
              {logLines.map((line, i) => (
                <motion.div key={i} variants={staggerItem} className={line.color}>
                  {line.text}
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-slate-600 mt-2"
              >
                _
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
