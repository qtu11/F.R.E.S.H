'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CustomerNavigation } from '@/components/CustomerNavigation';
import { PageTransition } from '@/components/PageTransition';
import { Fingerprint, ShieldAlert, AlertCircle } from 'lucide-react';


export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const [biometricStatus, setBiometricStatus] = useState<'none' | 'pending' | 'verified' | 'rejected'>('none');

  useEffect(() => {
    if (!user) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/biometric?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.record) {
          setBiometricStatus(data.record.status);
        }
      } catch (err) {
        console.error("Lỗi lấy trạng thái sinh trắc học layout:", err);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user]);


  useEffect(() => {
    if (!loading && (!user || user.role !== 'customer')) {
      router.replace('/customer/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = main.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      main.style.setProperty('--mouse-x', `${x}px`);
      main.style.setProperty('--mouse-y', `${y}px`);
    };
    main.addEventListener('mousemove', handleMouseMove);
    return () => main.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (loading || !user || user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-mono text-xs animate-pulse">CONNECTING FRESH WARRIOR HUB...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mainRef} 
      className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-800 dark:text-slate-100 pb-20 pt-14 md:pt-0 md:pb-0 md:pl-64 relative overflow-hidden transition-colors duration-500"
    >
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
        backgroundSize: '45px 45px',
      }} />

      {/* Enhanced Dynamic Mouse Spotlight Glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-100 dark:opacity-65 transition-opacity duration-500" 
        style={{
          background: 'radial-gradient(circle 450px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), rgba(16, 185, 129, 0.14), rgba(59, 130, 246, 0.04) 45%, transparent 75%)'
        }} 
      />

      {/* Interactive Cursor Trailer Dot */}
      <div 
        className="absolute w-4 h-4 rounded-full bg-emerald-500/25 dark:bg-emerald-400/35 border border-emerald-500/60 pointer-events-none z-50 transition-all duration-[120ms] ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: 'var(--mouse-x, -999px)',
          top: 'var(--mouse-y, -999px)',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)'
        }}
      />

      <CustomerNavigation />
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto relative z-10">
        {/* Banner xác minh danh tính eKYC */}
        {biometricStatus === 'pending' && (
          <div className="mb-6 p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Fingerprint className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-amber-700 dark:text-amber-400">Hồ sơ eKYC (Face ID) đang chờ duyệt</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Hồ sơ xác minh danh tính của bạn đang được Ban Quản Trị xem xét. Các tính năng thanh toán nâng cao tạm thời bị giới hạn.</p>
              </div>
            </div>
          </div>
        )}

        {(biometricStatus === 'none' || biometricStatus === 'rejected') && (
          <div className="mb-6 p-4 rounded-3xl bg-red-500/10 border border-red-500/20 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-red-700 dark:text-red-400">
                  {biometricStatus === 'rejected' ? 'Hồ sơ eKYC bị từ chối' : 'Yêu cầu xác minh danh tính'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                  {biometricStatus === 'rejected' 
                    ? 'Hồ sơ xác minh của bạn đã bị từ chối. Vui lòng quét Face ID lại để xác thực.' 
                    : 'Tài khoản của bạn chưa được xác minh sinh trắc học. Quét Face ID ngay để kích hoạt ví và bảo mật tối đa.'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/customer/profile?verify=true')}
              className="bg-[#057A42] hover:bg-[#046034] text-white text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all whitespace-nowrap shadow-md cursor-pointer"
            >
              {biometricStatus === 'rejected' ? 'Xác minh lại' : 'Xác minh ngay'}
            </button>
          </div>
        )}

        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
