'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Store, ShieldCheck, ArrowRight, Leaf, Globe, Mail, Phone, MapPin, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';
import { useGlobal } from '@/app/providers';

const ThreeDBackground = () => {
  return (
    <div className="absolute inset-0 z-0 h-[800px] w-full pointer-events-none opacity-50 dark:opacity-100">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#10b981" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3b82f6" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <Sphere args={[1.5, 64, 64]} position={[2, 0, -2]}>
            <MeshDistortMaterial color="#057A42" attach="material" distort={0.4} speed={1.5} roughness={0.2} metalness={0.8} />
          </Sphere>
        </Float>
        <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
          <Sphere args={[1, 64, 64]} position={[-2, 1, -3]}>
            <MeshDistortMaterial color="#0f172a" attach="material" distort={0.5} speed={2} roughness={0.1} metalness={0.9} />
          </Sphere>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950" />
    </div>
  );
};

const DashboardPreview = () => {
  const { t } = useGlobal();
  const [stats, setStats] = useState({
    foodSaved: 1248392,
    co2Reduced: 418.5,
    activeStores: 8102
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        foodSaved: prev.foodSaved + Math.floor(Math.random() * 5),
        co2Reduced: prev.co2Reduced + Number((Math.random() * 0.1).toFixed(1)),
        activeStores: prev.activeStores + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 px-4 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-[2rem] mx-4 md:mx-auto max-w-6xl mt-24 mb-12 shadow-xl dark:shadow-[0_0_50px_rgba(16,185,129,0.1)] relative z-10 transition-colors"
    >
      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        <div>
          <p className="text-[11px] text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2 font-bold">{t('food_rescued_stat')}</p>
          <p className="text-3xl font-mono font-black text-[#057A42] dark:text-emerald-400">{stats.foodSaved.toLocaleString()} <span className="text-sm text-gray-400 dark:text-slate-400 font-bold">KG</span></p>
        </div>
        <div className="hidden md:block w-px h-16 bg-gray-200 dark:bg-white/10"></div>
        <div>
          <p className="text-[11px] text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2 font-bold">{t('co2_reduction_stat')}</p>
          <p className="text-3xl font-mono font-black text-[#057A42] dark:text-emerald-400">{stats.co2Reduced.toFixed(1).toLocaleString()} <span className="text-sm text-gray-400 dark:text-slate-400 font-bold">TONS</span></p>
        </div>
        <div className="hidden md:block w-px h-16 bg-gray-200 dark:bg-white/10"></div>
        <div>
          <p className="text-[11px] text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2 font-bold">{t('active_nodes_stat')}</p>
          <p className="text-3xl font-mono font-black text-[#057A42] dark:text-emerald-400">{stats.activeStores.toLocaleString()} <span className="text-sm text-gray-400 dark:text-slate-400 font-bold">PARTNERS</span></p>
        </div>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const { t } = useGlobal();

  return (
    <main className="min-h-screen relative flex flex-col bg-white dark:bg-slate-950 selection:bg-emerald-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex justify-center px-6 transition-colors">
        <div className="w-full max-w-7xl flex justify-between items-center h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#057A42] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-white italic">F</span>
            </div>
            <div className="leading-none text-left hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">F.R.E.S.H <span className="text-[#057A42] dark:text-emerald-400">AI</span></h1>
              <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1 font-bold">Rescue • ESG • Hyperlocal</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-300">
              <Link href="#about" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">About</Link>
              <Link href="#portals" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Portals</Link>
              <Link href="#contact" className="hover:text-[#057A42] dark:hover:text-emerald-400 transition-colors">Contact</Link>
            </nav>
            <Link href="/customer">
              <button className="px-6 py-2.5 rounded-full bg-[#057A42] hover:bg-[#046034] text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all">
                {t('log_out').replace('Đăng xuất', 'Login').replace('Log Out', 'Login')} 
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-20">
        <ThreeDBackground />
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[#057A42] dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            Next-Gen AI Logistics & ESG Platform
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-gray-900 dark:text-white"
          >
            {t('hero_title').split('.').map((part, i) => (
              <span key={i} className={i === 0 ? '' : i === 1 ? 'text-[#057A42] dark:text-emerald-400' : 'text-orange-500'}>
                {part}{i < 2 ? '.' : ''} {i === 0 ? <br className="hidden md:block" /> : ''}
              </span>
            ))}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12"
          >
            {t('hero_subtitle')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#portals">
              <button className="px-10 py-4 rounded-full bg-[#057A42] text-white text-sm font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                {t('explore_portals')}
              </button>
            </Link>
            <Link href="#about">
              <button className="px-10 py-4 rounded-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700 shadow-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                {t('learn_how')}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <DashboardPreview />

      {/* About */}
      <section id="about" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">{t('about_title')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-3xl mx-auto text-lg font-medium">{t('about_desc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Search, title: "AI Discovery", desc: "Our engine analyzes your preferences and location to find the best expiring food deals instantly." },
            { icon: Globe, title: "Hyperlocal Network", desc: "A connected web of verified supermarkets and restaurants, delivering within minimum time and footprint." },
            { icon: Leaf, title: "ESG & Green Credit", desc: "Every rescue translates into measurable CO2 reduction, granting you Green Credits and eco-rewards." },
            { icon: Store, title: "Dynamic Pricing", desc: "Algorithms auto-adjust prices as products near expiry, maximizing recovery for merchants & savings for you." }
          ].map((feature, i) => (
            <motion.div key={i} className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 hover:shadow-2xl transition-all group">
              <div className="w-16 h-16 bg-[#057A42] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="relative z-10 w-full bg-gray-50 dark:bg-slate-900/50 py-32 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Choose Your Portal</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium mb-20">Secure enterprise-grade interfaces tailored for each role.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { href: '/customer', icon: ShoppingBag, title: t('consumer_portal'), desc: t('consumer_desc'), tag: t('enter_portal'), color: 'emerald' },
              { href: '/partner', icon: Store, title: 'Partner Console', desc: t('partner_portal_desc'), tag: t('merchant_hub'), color: 'blue' },
              { href: '/admin/login', icon: ShieldCheck, title: 'Enterprise Admin', desc: t('admin_portal_desc'), tag: t('secure_login'), color: 'slate' }
            ].map((portal, i) => (
              <Link key={i} href={portal.href} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl bg-${portal.color}-500 text-white flex items-center justify-center mb-8 shadow-lg`}>
                  <portal.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{portal.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 font-medium mb-8 flex-grow">{portal.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                   <span className="text-xs font-black uppercase tracking-widest text-[#057A42] dark:text-emerald-400">{portal.tag}</span>
                   <ArrowRight className="w-6 h-6 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative z-10 w-full max-w-6xl mx-auto px-6 py-32">
        <div className="bg-[#057A42] dark:bg-emerald-900 rounded-[3.5rem] p-10 md:p-20 flex flex-col lg:flex-row items-center gap-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="flex-1 text-white relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tight">{t('need_assistance')}</h2>
            <p className="text-white/80 text-xl font-medium mb-12">{t('assistance_desc')}</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Mail className="w-6 h-6" /></div>
                <span className="font-bold text-lg">support@fresh-platform.ai</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Phone className="w-6 h-6" /></div>
                <span className="font-bold text-lg">1-800-FRESH-AI (VN)</span>
              </div>
            </div>
          </div>
          <form className="w-full lg:w-[450px] bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl space-y-4 relative z-10">
             <h3 className="text-gray-900 dark:text-white font-black text-xl uppercase mb-4">{t('send_message')}</h3>
             <input type="text" placeholder={t('your_name')} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-5 py-4 font-bold" />
             <input type="email" placeholder={t('your_email')} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-5 py-4 font-bold" />
             <textarea placeholder={t('how_help')} rows={4} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-5 py-4 font-bold resize-none"></textarea>
             <button className="w-full bg-[#057A42] text-white font-black py-5 rounded-xl uppercase tracking-widest shadow-lg hover:bg-[#046034] transition-all">
                {t('submit_request')}
             </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 w-full py-12 border-t border-gray-100 dark:border-white/5 text-center px-6">
        <p className="text-gray-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} F.R.E.S.H Platform. EMPOWERED BY ENTERPRISE AI.
        </p>
      </footer>
    </main>
  );
}
