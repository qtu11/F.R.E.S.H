'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useGlobal } from '@/app/providers';

export default function AdminLogin() {
  const { t } = useGlobal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'freshadmin@gmail.com' && password === 'AdminFresh@') {
      router.push('/admin');
    } else {
      setError('Invalid credentials or unverified IP address.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden px-4 transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#057A42]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 mb-6 shadow-2xl transition-colors">
             <ShieldCheck className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight uppercase">{t('admin_console')}</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase">{t('secure_login')}</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-100 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-2xl transition-colors">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">
                 {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                <input 
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                  placeholder="freshadmin@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                <input 
                  type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                  placeholder="••••••••••"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#057A42] hover:bg-[#046034] text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl hover:shadow-[#057A42]/30 uppercase tracking-widest text-sm">
               {t('enter_portal')} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 dark:text-slate-600 justify-center uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 2FA Enforced</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> IP Logged</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
