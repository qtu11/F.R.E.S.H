'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, ShoppingBag, Leaf, User } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export function CustomerNavigation() {
  const pathname = usePathname();
  const { t } = useGlobal();

  const navItems = [
    { icon: Map, label: t('explore'), href: '/customer' },
    { icon: ShoppingBag, label: t('orders'), href: '/customer/orders' },
    { icon: Leaf, label: t('impact'), href: '/customer/impact' },
    { icon: User, label: t('profile'), href: '/customer/profile' },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-around px-4 z-40 rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.05)] transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 relative w-16 group">
              {isActive && (
                <motion.div layoutId="mobileNavIndicator" className="absolute -top-4 w-12 h-1 bg-[#057A42] dark:bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(5,122,66,0.2)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              )}
              <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[#057A42] dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#057A42] dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col z-40 shadow-sm transition-colors duration-300">
        <div className="p-6">
          <Link href="/" className="font-heading font-bold text-2xl tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-[#057A42] dark:bg-emerald-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl font-black text-white italic">F</span>
            </div>
            F.R.E.S.H.
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive ? 'bg-[#e8f5e9] dark:bg-emerald-500/10 text-[#057A42] dark:text-emerald-400 font-semibold border border-[#c8e6c9] dark:border-emerald-500/20' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white border border-transparent'}`}>
                <item.icon className="w-5 h-5 z-10" />
                <span className="z-10">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="desktopNavIndicator" className="absolute left-0 w-1 h-8 bg-[#057A42] dark:bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(5,122,66,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 w-full bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-slate-700">
             <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 dark:text-yellow-500 font-bold text-lg shadow-sm border border-yellow-200 dark:border-yellow-700/50">
                JD
             </div>
             <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">John Doe</div>
                <div className="text-xs font-semibold text-[#057A42] dark:text-emerald-400">{t('gold_member')}</div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
