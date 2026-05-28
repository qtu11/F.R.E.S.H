'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Lock, Mail, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';
import { HumanVerification } from '@/components/HumanVerification';
import { AuthSettings } from '@/components/AuthSettings';

function LoginForm() {
  const { t } = useGlobal();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/customer';

  // Đọc email đã nhớ khi tải trang
  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // Lưu hoặc xóa email đã nhớ dựa trên checkbox
      if (rememberMe) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }
      window.location.href = redirect;
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden px-4 transition-colors duration-300">
      {/* Background động tương tác */}
      <DynamicBackground />

      {/* Settings: Theme & Language */}
      <AuthSettings />



      {/* Home Navigation Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 hover:-translate-x-1 duration-200 z-50 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Home
      </Link>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#057A42]/5 dark:bg-[#057A42]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-400/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{ y: -3 }}
        className="w-full max-w-md relative z-10 transition-all duration-300"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-6 shadow-2xl transition-colors cursor-pointer"
          >
            <Leaf className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase">Sign in to your account</p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-10 rounded-[2.5rem] shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-500">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-400 transition-all font-bold"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800/80 rounded-2xl py-4 pl-12 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-400 transition-all font-bold"
                  placeholder="Enter your password"
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

            {/* Checkbox Ghi nhớ đăng nhập và Quên mật khẩu */}
            <div className="flex items-center justify-between pl-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-200 dark:border-slate-800 text-[#057A42] focus:ring-[#057A42] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-450">Ghi nhớ đăng nhập</span>
              </label>
              <Link 
                href="/customer/forgot-password" 
                className="text-xs font-bold text-[#057A42] dark:text-emerald-400 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Human Verification Filter */}
            <div className="pt-2">
              <HumanVerification onVerify={setIsVerified} />
            </div>

            <button 
              type="submit" 
              disabled={loading || !isVerified} 
              className="w-full bg-[#057A42] hover:bg-[#046034] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl hover:shadow-[#057A42]/30 dark:hover:shadow-emerald-500/20 uppercase tracking-widest text-sm disabled:opacity-50 select-none"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 text-center">
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
              Don&apos;t have an account?{' '}
              <Link href="/customer/register" className="text-[#057A42] dark:text-emerald-400 font-bold hover:underline">
                Create Account
              </Link>
            </p>
            <div className="flex justify-center gap-4 text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold">
              <Link href="/terms" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Điều khoản</Link>
              <span>&middot;</span>
              <Link href="/privacy" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CustomerLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  );
}
