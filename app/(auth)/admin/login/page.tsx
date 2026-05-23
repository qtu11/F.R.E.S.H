'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

function LoginForm() {
  const { t } = useGlobal();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden px-4 transition-colors duration-300">
      {/* Home Navigation Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 hover:-translate-x-1 duration-200 z-50 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Home
      </Link>

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
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('your_email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                  placeholder={t('email_placeholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] transition-all font-bold"
                  placeholder={t('password_placeholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#057A42] hover:bg-[#046034] text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl hover:shadow-[#057A42]/30 uppercase tracking-widest text-sm disabled:opacity-50">
              {loading ? 'Signing in...' : t('enter_portal')} <ArrowRight className="w-5 h-5" />
            </button>

            {/* Customer Portal Quick Navigation Link */}
            <div className="mt-4 flex flex-col gap-2">
              <Link 
                href="/customer/login" 
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100/50 dark:bg-slate-800/30 hover:bg-[#057A42]/10 text-slate-700 dark:text-slate-200 hover:text-[#057A42] dark:hover:text-emerald-400 font-bold rounded-2xl transition-all duration-200 text-xs uppercase tracking-wider border border-transparent hover:border-[#057A42]/20 dark:hover:border-emerald-500/20"
              >
                Cổng Khách Hàng (Customer Portal)
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 dark:text-slate-600 justify-center uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Secure</span>
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Encrypted</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  );
}
