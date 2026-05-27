'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Lock, Mail, ArrowRight, ArrowLeft, Key, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { DynamicBackground } from '@/components/DynamicBackground';
import { HumanVerification } from '@/components/HumanVerification';
import { AuthSettings } from '@/components/AuthSettings';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();

  // Gửi yêu cầu OTP về email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        setStep(2);
      } else {
        setError(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận OTP và cập nhật mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 8) {
      setError('Mã OTP phải có độ dài chính xác là 8 chữ số.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(3);
      } else {
        setError(data.error || 'Xác nhận OTP thất bại. Vui lòng kiểm tra lại mã.');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden px-4 transition-colors duration-300 font-sans">
      {/* Background động tương tác */}
      <DynamicBackground />

      {/* Settings: Theme & Language */}
      <AuthSettings />



      {/* Back Button */}
      <Link 
        href="/customer/login" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-[#057A42] dark:hover:text-emerald-400 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-880/80 backdrop-blur-xl rounded-xl shadow-md transition-all hover:scale-105 hover:-translate-x-1 duration-200 z-50 select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Đăng nhập
      </Link>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#057A42]/5 dark:bg-[#057A42]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-400/5 dark:bg-emerald-400/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 transition-all duration-300"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-6 shadow-2xl transition-colors cursor-pointer"
          >
            <Leaf className="w-10 h-10 text-[#057A42] dark:text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Khôi Phục Mật Khẩu</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase">Hệ thống xác thực F.R.E.S.H Secure</p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-500">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: NHẬP EMAIL */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">Nhập địa chỉ email tài khoản của bạn. Chúng tôi sẽ gửi một mã OTP gồm 6 chữ số để xác thực quyền sở hữu.</p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Địa chỉ Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                      <input
                        type="email" required
                        value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-400 transition-all font-bold"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Human Verification */}
                  <div className="pt-2">
                    <HumanVerification onVerify={setIsVerified} />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !isVerified} 
                    className="w-full bg-[#057A42] hover:bg-[#046034] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl hover:shadow-[#057A42]/30 dark:hover:shadow-emerald-500/20 uppercase tracking-widest text-xs disabled:opacity-50 select-none cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi mã xác thực'} 
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: NHẬP OTP VÀ MẬT KHẨU MỚI */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 py-3 px-4 rounded-xl border border-emerald-500/25">
                    {successMessage || 'Mã OTP đã được gửi thành công.'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-3 leading-relaxed font-semibold">Vui lòng nhập mã OTP 8 chữ số và mật khẩu đăng nhập mới cho tài khoản của bạn.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs text-center font-bold">
                      {error}
                    </div>
                  )}

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mã OTP (8 chữ số)</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                      <input
                        type="text" required maxLength={8}
                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-880/80 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-400 transition-all font-bold text-center tracking-[8px] text-lg font-mono"
                        placeholder="00000000"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                      <input
                        type="password" required
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-400 transition-all font-bold"
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-slate-600" />
                      <input
                        type="password" required
                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#057A42] dark:focus:ring-emerald-400 transition-all font-bold"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-[#057A42] hover:bg-[#046034] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl hover:shadow-[#057A42]/30 dark:hover:shadow-emerald-500/20 uppercase tracking-widest text-xs disabled:opacity-50 select-none cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận đổi mật khẩu'} 
                    {!loading && <ShieldCheck className="w-4 h-4" />}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: KHÔI PHỤC THÀNH CÔNG */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Đặt Lại Thành Công!</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
                    Mật khẩu tài khoản của bạn đã được cập nhật mới thành công trên hệ thống. Bây giờ bạn có thể đăng nhập lại ngay lập tức.
                  </p>
                </div>
                
                <button
                  onClick={() => router.push('/customer/login')}
                  className="w-full bg-[#057A42] hover:bg-[#046034] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-[#057A42]/30 dark:hover:shadow-emerald-500/20 uppercase tracking-widest text-xs cursor-pointer select-none"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
