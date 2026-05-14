'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Activity, Users, Database, Server, Headphones } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export function AdminNavigation() {
  const pathname = usePathname();
  const { t } = useGlobal();

  const navItems = [
    { icon: Activity, label: t('overview'), href: '/admin' },
    { icon: Users, label: t('partners_approvals'), href: '/admin/partners' },
    { icon: ShieldCheck, label: t('fraud_log'), href: '/admin/fraud' },
    { icon: Database, label: t('esg_data'), href: '/admin/esg' },
    { icon: Headphones, label: t('customer_care'), href: '/admin/customer-care' },
    { icon: Server, label: t('system_health'), href: '/admin/system' },
  ];

  if (pathname === '/admin/login') return null;

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.05)] transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 relative w-16 group">
              {isActive && (
                <motion.div layoutId="mobileNavIndicatorAdmin" className="absolute -top-4 w-12 h-1 bg-[#057A42] dark:bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(5,122,66,0.2)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              )}
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#057A42] dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`} />
              <span className={`text-[9px] font-medium text-center leading-tight transition-colors ${isActive ? 'text-[#057A42] dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

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
