'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { PartnerNavigation } from '@/components/PartnerNavigation';
import { PageTransition } from '@/components/PageTransition';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'partner')) {
      router.replace('/partner/login');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-400 font-mono text-xs animate-pulse">CONNECTING PARTNER KERNEL...</div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'partner') {
    return null;
  }

  return (
    <div 
      ref={mainRef} 
      className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-800 dark:text-slate-100 pb-20 pt-14 md:pt-0 md:pb-0 md:pl-64 selection:bg-emerald-500/30 relative overflow-hidden transition-colors duration-500"
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
          background: 'radial-gradient(circle 450px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), rgba(249, 115, 22, 0.12), rgba(16, 185, 129, 0.04) 45%, transparent 75%)'
        }} 
      />

      {/* Interactive Cursor Trailer Dot */}
      <div 
        className="absolute w-4 h-4 rounded-full bg-orange-500/25 dark:bg-orange-400/35 border border-orange-500/60 pointer-events-none z-50 transition-all duration-[120ms] ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: 'var(--mouse-x, -999px)',
          top: 'var(--mouse-y, -999px)',
          boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)'
        }}
      />

      <PartnerNavigation />
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
