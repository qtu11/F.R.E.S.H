'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PartnerNavigation } from '@/components/PartnerNavigation';
import { PageTransition } from '@/components/PageTransition';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const [orgStatus, setOrgStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'partner')) {
      router.replace('/partner/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'partner') return;
    fetch('/api/organizations/mine')
      .then(res => { if (!res.ok) throw new Error('Failed to fetch org'); return res.json(); })
      .then(data => {
        if (!data?.id) {
          router.replace('/partner/register');
          return;
        }
        setOrgStatus(data.status);
        setCheckingStatus(false);
      })
      .catch(() => {
        setCheckingStatus(false);
      });
  }, [user, router]);

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

  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-mono text-xs animate-pulse">CONNECTING PARTNER KERNEL...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'partner') return null;

  return (
    <div
      ref={mainRef}
      className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-800 dark:text-slate-100 pb-20 pt-14 md:pt-0 md:pb-0 md:pl-64 selection:bg-emerald-500/30 relative overflow-hidden transition-colors duration-500"
    >
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.015] pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
        backgroundSize: '45px 45px',
      }} />

      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-100 dark:opacity-65 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle 450px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), rgba(249, 115, 22, 0.12), rgba(16, 185, 129, 0.04) 45%, transparent 75%)'
        }}
      />

      <div
        className="absolute w-4 h-4 rounded-full bg-orange-500/25 dark:bg-orange-400/35 border border-orange-500/60 pointer-events-none z-50 transition-all duration-[120ms] ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: 'var(--mouse-x, -999px)',
          top: 'var(--mouse-y, -999px)',
          boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)'
        }}
      />

      <PartnerNavigation isPending={orgStatus !== 'approved'} />
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto relative z-10">
        {orgStatus && orgStatus !== 'approved' && (
          <div className="mb-6 p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {orgStatus === 'rejected' ? 'Hồ sơ chưa được duyệt' : 'Hồ sơ đang chờ thẩm định (KYB)'}
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                {orgStatus === 'rejected'
                  ? 'Vui lòng kiểm tra email và cập nhật hồ sơ để tiếp tục.'
                  : 'Bạn chỉ có thể xem thông tin doanh nghiệp trong lúc chờ duyệt.'
                }
              </p>
            </div>
            <Link href="/partner/register" className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all">
              Bổ sung giấy tờ
            </Link>
          </div>
        )}
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
