'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PackageSearch, Tag, Wallet, ShoppingCart, BarChart3, Megaphone, Users, Plug, Menu, ArrowLeft, X, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';

export function PartnerNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useGlobal();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutMobile, setShowLogoutMobile] = useState(false);
  const [showLogoutDesktop, setShowLogoutDesktop] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/partner' },
    { icon: PackageSearch, label: t('inventory'), href: '/partner/inventory' },
    { icon: Tag, label: t('pricing'), href: '/partner/pricing' },
    { icon: ShoppingCart, label: t('orders'), href: '/partner/orders' },
    { icon: BarChart3, label: t('analytics'), href: '/partner/analytics' },
    { icon: Megaphone, label: t('marketing'), href: '/partner/marketing' },
    { icon: Users, label: t('staff'), href: '/partner/staff' },
    { icon: Plug, label: t('integration'), href: '/partner/integration' },
    { icon: Wallet, label: t('finance'), href: '/partner/finance' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/partner/login');
  };

  const displayName = user?.name || 'WinMart+ D1';
  const initialLetter = displayName.charAt(0).toUpperCase() || 'P';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 z-[60]">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Open menu">
            <Menu className="w-5 h-5 text-gray-700 dark:text-slate-300" />
          </button>
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-slate-300" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#057A42] rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">Partner</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#057A42] rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-white">F</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Partner</span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close menu">
                  <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#e8f5e9] dark:bg-emerald-500/10 text-[#057A42] dark:text-emerald-400 font-semibold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                      {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-[#057A42] dark:bg-emerald-400" />}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 relative">
                {/* Mobile Logout Dropdown Overlay */}
                {showLogoutMobile && (
                  <div className="fixed inset-0 z-40" onClick={() => setShowLogoutMobile(false)} />
                )}

                <AnimatePresence>
                  {showLogoutMobile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50"
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                  onClick={() => setShowLogoutMobile(!showLogoutMobile)}
                  className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-[#057A42]/20 border border-emerald-250 dark:border-[#057A42]/30 flex items-center justify-center shrink-0">
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{initialLetter}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</div>
                    <div className="text-xs font-semibold text-[#057A42] dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
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
          <Link href="/" className="font-heading font-bold text-2xl tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#057A42] dark:bg-emerald-500 flex items-center justify-center shadow-md">
               <span className="text-white text-sm font-bold">F</span>
            </div>
            Partner HQ
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
                  <motion.div layoutId="desktopNavIndicatorPartner" className="absolute left-0 w-1 h-8 bg-[#057A42] dark:bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(5,122,66,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-slate-800 relative">
          {/* Desktop Logout Dropdown Overlay */}
          {showLogoutDesktop && (
            <div className="fixed inset-0 z-40" onClick={() => setShowLogoutDesktop(false)} />
          )}

          <AnimatePresence>
            {showLogoutDesktop && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-20 left-6 right-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1.5 shadow-xl z-50"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            onClick={() => setShowLogoutDesktop(!showLogoutDesktop)}
            className="flex items-center gap-3 w-full bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors select-none"
          >
             <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-[#057A42]/20 border border-emerald-250 dark:border-[#057A42]/30 flex items-center justify-center shrink-0">
                <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{initialLetter}</span>
             </div>
             <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</div>
                <div className="text-xs font-semibold text-[#057A42] dark:text-emerald-400 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
