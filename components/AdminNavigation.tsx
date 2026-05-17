'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Activity, Users, Database, Server, Headphones, UserCheck, DollarSign, TrendingUp, MapPin, Megaphone, UserCog, Menu, ArrowLeft, X } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useGlobal();

  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { icon: Activity, label: t('overview'), href: '/admin' },
    { icon: Users, label: t('partners_approvals'), href: '/admin/partners' },
    { icon: UserCheck, label: t('users'), href: '/admin/users' },
    { icon: DollarSign, label: t('commission'), href: '/admin/commission' },
    { icon: TrendingUp, label: t('forecasting'), href: '/admin/forecasting' },
    { icon: MapPin, label: t('heatmap'), href: '/admin/heatmap' },
    { icon: ShieldCheck, label: t('fraud_log'), href: '/admin/fraud' },
    { icon: Database, label: t('esg_data'), href: '/admin/esg' },
    { icon: Megaphone, label: t('marketing'), href: '/admin/marketing' },
    { icon: Headphones, label: t('customer_care'), href: '/admin/customer-care' },
    { icon: UserCog, label: t('admin_roles'), href: '/admin/roles' },
    { icon: Server, label: t('system_health'), href: '/admin/system' },
  ];

  if (pathname === '/admin/login') return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 flex items-center justify-between px-4 z-[60]">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-800 transition-colors" aria-label="Open menu">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-800 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#057A42]" />
          <span className="font-bold text-sm text-white">Console</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-slate-900 z-[70] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#057A42]" />
                  <span className="font-bold text-lg text-white">F.R.E.S.H.</span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 transition-colors" aria-label="Close menu">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                      {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-xs font-bold">SA</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Super Admin</div>
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> connected
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col z-40 shadow-sm transition-colors duration-300">
        <div className="p-6">
          <Link href="/" className="font-heading font-bold text-xl tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#057A42] dark:text-emerald-500" />
            F.R.E.S.H. Console
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4">Management</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all relative ${isActive ? 'bg-[#e8f5e9] dark:bg-emerald-500/10 text-[#057A42] dark:text-emerald-400 font-semibold border border-[#c8e6c9] dark:border-emerald-500/20' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white border border-transparent'}`}>
                <item.icon className="w-4 h-4 z-10" />
                <span className="text-sm font-medium z-10">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="desktopNavIndicatorAdmin" className="absolute left-0 w-1 h-6 bg-[#057A42] dark:bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(5,122,66,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 w-full bg-gray-50 dark:bg-slate-800 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
             <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] dark:bg-emerald-900/30 border border-[#c8e6c9] dark:border-emerald-800/50 flex items-center justify-center">
                <span className="text-[#057A42] dark:text-emerald-400 text-xs font-bold">SA</span>
             </div>
             <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Super Admin</div>
                <div className="text-[10px] font-mono text-[#057A42] dark:text-emerald-400 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-[#057A42] dark:bg-emerald-500 rounded-full animate-pulse" /> connected
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
