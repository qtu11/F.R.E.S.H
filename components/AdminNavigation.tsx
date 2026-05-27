'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Activity, Users, Database, Server, Headphones, UserCheck, DollarSign, TrendingUp, MapPin, Megaphone, UserCog, Menu, ArrowLeft, X, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';

export function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useGlobal();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutMobile, setShowLogoutMobile] = useState(false);
  const [showLogoutDesktop, setShowLogoutDesktop] = useState(false);

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
    { icon: MessageSquare, label: t('customer_care'), href: '/admin/customer-care' },
    { icon: UserCog, label: t('admin_roles'), href: '/admin/roles' },
    { icon: Server, label: t('system_health'), href: '/admin/system' },
    { icon: Settings, label: t('settings'), href: '/admin/settings' },
  ];

  if (pathname === '/admin/login') return null;

  const displayName = user?.name || 'Super Admin';
  const displayRole = user?.role === 'admin' ? 'Super Admin' : (user?.role || 'Super Admin');
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-[60] transition-colors duration-500">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Open menu">
            <Menu className="w-5 h-5 text-slate-655 dark:text-slate-300" />
          </button>
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-slate-655 dark:text-slate-300" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-black text-xs uppercase tracking-widest text-slate-855 dark:text-white">Console</span>
        </div>
        <div className="w-10" />
      </div>
 
      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-500">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">F.R.E.S.H.</span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close menu">
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'}`}>
                       <item.icon className="w-5 h-5 z-10" />
                       <span className="text-sm z-10">{item.label}</span>
                       {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 relative">
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
                      className="absolute bottom-20 left-4 right-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50"
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                  onClick={() => setShowLogoutMobile(!showLogoutMobile)}
                  className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-250 select-none"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">{initials}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{displayName}</div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> connected
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
 
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex-col z-40 shadow-xl shadow-slate-100/5 dark:shadow-none transition-all duration-500">
        <div className="p-6">
          <Link href="/" className="font-heading font-black text-lg uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2 group">
            <div className="w-7 h-7 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            F.R.E.S.H. Console
          </Link>
        </div>
 
        <nav className="flex-1 px-4 space-y-1 mt-6">
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Management</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative group ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                <item.icon className="w-4 h-4 z-10" />
                <span className="text-sm font-semibold z-10">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="desktopNavIndicatorAdmin" 
                    className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
 
        <div className="p-6 border-t border-slate-200 dark:border-slate-850 relative">
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
                className="absolute bottom-20 left-6 right-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-1.5 shadow-xl z-50"
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
            className="flex items-center gap-3 w-full bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-inner cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-250 select-none"
          >
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-900/30 border border-emerald-500/20 dark:border-emerald-800/40 flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">{initials}</span>
             </div>
             <div>
                <div className="text-xs font-black text-slate-800 dark:text-white">{displayName}</div>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> connected
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
