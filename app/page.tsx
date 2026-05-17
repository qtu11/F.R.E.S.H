'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useGlobal } from '@/app/providers';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, useScroll as useR3FScroll } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import {
  ShoppingBag, Store, ShieldCheck, ArrowRight, Leaf, Globe, Mail, Phone, Search,
  Sparkles, ChevronDown, Star, Layers, TrendingUp, BarChart3, Zap, Users,
  Shield, Menu, X, Moon, Sun, Award, BadgeCheck, Repeat, ScanLine,
  ChevronRight, ExternalLink, Target, TreePine,
  Wallet, Heart, Clock, Network, MapPin, Settings, Ruler, Coins, Rocket,
  Infinity, Cpu, Eye, LocateFixed, Quote
} from 'lucide-react';

// ─── 3D Scene ──────────────────────────────────────────────────
function Scene3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) { meshRef.current.rotation.x = t * 0.1; meshRef.current.rotation.y = t * 0.15; }
    if (torusRef.current) { torusRef.current.rotation.x = t * 0.08; torusRef.current.rotation.y = t * 0.12; }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.02;
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) positions[i + 1] += Math.sin(t + i) * 0.002;
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particlesPositions = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
    return positions;
  }, []);

  return (
    <group>
      <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial color="#00A86B" roughness={0.2} metalness={0.8} distort={0.15} speed={2} />
      </Sphere>
      <Torus ref={torusRef} args={[2.2, 0.05, 32, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#00A86B" transparent opacity={0.4} />
      </Torus>
      <Torus args={[2.8, 0.03, 16, 64]} position={[0, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </Torus>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlesPositions, 3]} count={400} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#34d399" transparent opacity={0.6} />
      </points>
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={1.5 + Math.random()} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh position={[
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3 - 2
          ]}>
            {i % 2 === 0 ? <boxGeometry args={[0.08, 0.08, 0.08]} /> : <icosahedronGeometry args={[0.06]} />}
            <meshBasicMaterial color={i % 3 === 0 ? '#FF6B00' : '#00A86B'} transparent opacity={0.5} />
          </mesh>
        </Float>
      ))}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#00A86B" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#34d399" />
    </group>
  );
}

// ─── Scene2D (fallback / static 3D visualization) ──────────────
function Hero3DEcosystem() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-full h-full rounded-3xl bg-gradient-to-br from-emerald-900/20 to-slate-900/20" />;
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <Scene3D />
    </Canvas>
  );
}

// ─── Particle Field Background ──────────────────────────────────
function ParticleField({ count = 30 }: { count?: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const hash = (i * 2654435761) % 10000;
      return {
        left: `${(hash % 100)}%`,
        top: `${(hash * 7 % 100)}%`,
        duration: 3 + (hash * 3 % 400) / 100,
        delay: (hash * 13 % 500) / 100,
      };
    });
  }, [count]);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.duration, repeat: 9999, delay: p.delay }}
        />
      ))}
    </div>
  );
}

// ─── Magnetic Button ────────────────────────────────────────────
function MagneticButton({ children, className = '', onClick, href }: {
  children: React.ReactNode; className?: string; onClick?: () => void; href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) { x.set((e.clientX - rect.left - rect.width / 2) * 0.3); y.set((e.clientY - rect.top - rect.height / 2) * 0.3); }
  }, [x, y]);

  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  const content = (
    <motion.div
      ref={ref} onMouseMove={handleMouse} onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  );

  if (href) return <Link href={href} onClick={onClick}>{content}</Link>;
  return <button onClick={onClick} className="p-0 border-none bg-transparent">{content}</button>;
}

// ─── Counter Hook ───────────────────────────────────────────────
function useCounter(end: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { value, ref };
}

// ─── Section Wrapper ────────────────────────────────────────────
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
      className={`relative z-10 w-full ${className}`}
    >
      {children}
    </motion.section>
  );
}

// ─── DATA ───────────────────────────────────────────────────────
const NAV_LINKS = ['About', 'Technology', 'Impact', 'Network', 'Partners', 'AI Engine', 'Marketplace', 'Contact'];
const TECH_CARDS = [
  { icon: TrendingUp, title: 'AI Dynamic Pricing', desc: 'Real-time price optimization based on expiry, demand, and inventory data', color: '#00A86B' },
  { icon: MapPin, title: 'Hyperlocal Rescue Engine', desc: 'Geo-aware matching of surplus food to nearby consumers within minutes', color: '#FF6B00' },
  { icon: Leaf, title: 'ESG & Green Credit', desc: 'Automated carbon accounting and tokenized green reward system', color: '#10b981' },
  { icon: ScanLine, title: 'OCR Smart Scan', desc: 'Instant product recognition via AI-powered image processing', color: '#3b82f6' },
  { icon: BarChart3, title: 'SaaS Inventory Intelligence', desc: 'Predictive stock management with automated surplus alerts', color: '#8b5cf6' },
  { icon: Cpu, title: 'Predictive Demand AI', desc: 'ML-powered demand forecasting across hyperlocal networks', color: '#f97316' },
];
const STEPS = [
  { icon: ScanLine, title: 'Scan Expiring Products', desc: 'Merchants scan near-expiry items via our AI OCR engine', color: '#3b82f6' },
  { icon: TrendingUp, title: 'AI Dynamic Pricing', desc: 'Algorithm sets optimal rescue price automatically', color: '#00A86B' },
  { icon: Globe, title: 'Hyperlocal Marketplace', desc: 'Products appear instantly on nearby consumer feeds', color: '#FF6B00' },
  { icon: Award, title: 'Rescue & ESG Rewards', desc: 'Users earn Green Credits with measurable CO2 impact', color: '#10b981' },
];
const PARTNERS = [
  { name: 'WinMart+', icon: '🏪' }, { name: 'GS25', icon: '🏬' }, { name: 'Circle K', icon: '🛒' },
  { name: 'AEON Mall', icon: '🏢' }, { name: 'Co.opmart', icon: '🛍️' }, { name: 'FamilyMart', icon: '🏪' },
  { name: 'Lotte Mart', icon: '🏬' }, { name: 'MM Mega Market', icon: '🏪' },
];
const TESTIMONIALS = [
  { name: 'Minh Tran', role: 'Gen Z Consumer', q: 'I save 40% on groceries while helping the planet. This is the future of shopping.', avatar: 'MT', credit: 1250 },
  { name: 'Lan Nguyen', role: 'WinMart+ Manager', q: 'Our waste dropped 60% in 3 months. The AI pricing engine is revolutionary.', avatar: 'LN', credit: 890 },
  { name: 'Dr. Hieu Pham', role: 'ESG Advisor, UNDP', q: 'F.R.E.S.H demonstrates how technology can drive measurable climate action.', avatar: 'HP', credit: 2100 },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const { t, theme, setTheme } = useGlobal();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);
  const navBlur = useTransform(scrollYProgress, [0, 0.05], ['blur(0px)', 'blur(20px)']);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="min-h-screen relative bg-white dark:bg-slate-950 text-gray-900 dark:text-white overflow-x-hidden selection:bg-emerald-500/30 transition-colors duration-300">

      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-emerald-500/8 to-transparent rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-gradient-to-r from-orange-500/5 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <ParticleField count={20} />
      </div>

      {/* ─── NAVBAR ────────────────────────────────────────── */}
      <motion.header
        style={{ opacity: navOpacity, boxShadow: scrolled ? '0 8px 32px 0 rgba(0,0,0,0.08)' : 'none' }}
        className={`fixed top-4 inset-x-4 z-50 mx-auto max-w-7xl rounded-2xl transition-all duration-500 ${scrolled ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/5' : 'bg-transparent'}`}
      >
        <div className="flex items-center justify-between px-6 h-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-2xl font-black text-white italic">F</span>
              </div>
              <motion.div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: 9999 }} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tight uppercase">F.R.E.S.H <span className="text-emerald-500">AI</span></h1>
              <p className="text-[8px] text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">Rescue · ESG · Hyperlocal</p>
            </div>
          </motion.div>

          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-slate-300">
            {NAV_LINKS.map(item => {
              const key = 'nav_' + item.toLowerCase().replace(/\s+/g, '_');
              return (
                <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '_')}`}
                  className="px-3.5 py-2 rounded-lg hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all relative group"
                >
                  {t(key)}
                  <span className="absolute bottom-1 left-3 right-3 h-[2px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hidden sm:flex w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.button>

            <MagneticButton href="/customer">
              <div className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                <Zap className="w-3.5 h-3.5" />
                {t('launch_ecosystem')}
              </div>
            </MagneticButton>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 dark:border-slate-800"
            >
              <div className="px-6 py-4 space-y-2">
                {NAV_LINKS.map(item => {
                  const key = 'nav_' + item.toLowerCase().replace(/\s+/g, '_');
                  return (
                    <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '_')}`} onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-all"
                    >
                      {t(key)}
                    </Link>
                  );
                })}
                <Link href="/customer" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 text-center"
                >
                  {t('launch_ecosystem')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_60%)]" />

          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
            backgroundImage: `linear-gradient(rgba(0,168,107,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,107,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] mb-8">
              <Sparkles className="w-3 h-3" />
              {t('hero_badge')}
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.88] mb-8">
              <span className="text-gray-900 dark:text-white">{t('hero_title_1')}<br /></span>
              <span className="text-emerald-500">{t('hero_title_2')}<br /></span>
              <span className="text-orange-500">{t('hero_title_3')}</span>
            </h1>

            <p className="text-gray-500 dark:text-slate-400 text-lg sm:text-xl max-w-xl font-medium leading-relaxed mb-10">
              An AI-powered hyperlocal ecosystem transforming food waste into sustainable economic value through dynamic pricing, ESG analytics, and real-time rescue commerce.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton href="/customer">
                <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all">
                  {t('launch_ecosystem')}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </MagneticButton>
              <MagneticButton>
                <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest border border-gray-200 dark:border-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                  <PlayIcon />
                  {t('watch_demo')}
                </div>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Right - 3D Scene */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="h-[400px] md:h-[500px] lg:h-[600px] relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-orange-500/10" />
            <Hero3DEcosystem />
            {/* Floating labels */}
            <motion.div className="absolute top-8 left-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl px-3 py-2 text-xs font-bold shadow-lg border border-white/20"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: 9999, ease: 'easeInOut' }}>
              <span className="text-emerald-500">⬤ </span>12.4K {t('hero_floating_1')}
            </motion.div>
            <motion.div className="absolute bottom-12 right-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl px-3 py-2 text-xs font-bold shadow-lg border border-white/20"
              animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: 9999, ease: 'easeInOut' }}>
              🌍 98.5T {t('hero_floating_2')}
            </motion.div>
            <motion.div className="absolute top-1/3 -right-2 bg-orange-500/90 text-white backdrop-blur-md rounded-xl px-3 py-2 text-xs font-bold shadow-lg"
              animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: 9999 }}>
              -67% {t('hero_floating_3')}
            </motion.div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: 9999 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <ChevronDown className="w-6 h-6 text-gray-300 dark:text-slate-600" />
        </motion.div>
      </section>

      {/* ─── LIVE IMPACT STRIP ─────────────────────────────── */}
      <Section className="max-w-6xl mx-auto px-6 -mt-10 mb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-[2.5rem] p-8"
          style={{ boxShadow: '0 8px 40px 0 rgba(0,0,0,0.06)' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: 'Food Rescued', value: 1248392, suffix: ' KG', color: '#00A86B' },
              { label: 'CO₂ Reduced', value: 418500, suffix: ' KG', color: '#10b981' },
              { label: 'Active Partners', value: 8102, suffix: '', color: '#3b82f6' },
              { label: 'AI Pricing Accuracy', value: 97, suffix: ' %', color: '#8b5cf6' },
              { label: 'Rescue Orders', value: 45289, suffix: '', color: '#FF6B00' },
              { label: 'ESG Impact Score', value: 94, suffix: ' /100', color: '#f97316' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center group cursor-default"
              >
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] font-bold mb-2">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-black font-mono" style={{ color: stat.color }}>
                  <LiveCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <div className="w-0 h-0.5 bg-emerald-500 mx-auto mt-2 group-hover:w-3/4 transition-all duration-500 rounded-full" />
              </motion.div>
            ))}
          </div>
          {/* Pulse ring */}
          <motion.div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full" animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 3, repeat: 9999 }} />
        </motion.div>
      </Section>

      {/* ─── ABOUT SECTION ─────────────────────────────────── */}
      <Section id="about" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="h-[400px] relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border border-gray-100 dark:border-slate-800"
          >
            <Hero3DEcosystem />
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3 text-sm font-bold">
                <div className="flex -space-x-2">
                  {['MT', 'LN', 'HP'].map((a, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-800">{a}</div>
                  ))}
                </div>
                <span className="text-gray-600 dark:text-slate-300"><span className="text-emerald-500">12.4K+</span> {t('about_rescuers')}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 block">{t('about_badge')}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-8">
              {t('about_heading')} <span className="text-emerald-500">{t('about_heading_acc')}</span> Revolution
            </h2>
            <div className="space-y-4 text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <p>{t('about_p3')}</p>
            </div>
            <div className="flex gap-6 mt-8">
              {[
                { value: '8.2M', label: t('about_stat1_label'), color: 'text-orange-500' },
                { value: '60%', label: t('about_stat2_label'), color: 'text-emerald-500' },
                { value: '98.5K', label: t('about_stat3_label'), color: 'text-blue-500' },
              ].map((s, i) => (
                <div key={i}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ─── TECHNOLOGY SECTION ─────────────────────────────── */}
      <Section id="technology" className="py-24 bg-gray-50/50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 block">{t('tech_badge')}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{t('tech_heading')} <span className="text-emerald-500">{t('tech_heading_acc')}</span></h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mb-16">{t('tech_subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_CARDS.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all text-left overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(600px circle at 50% 50%, ${card.color}08, transparent)` }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: card.color }}>
                    <card.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3">{t('tech_title_' + i)}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{t('tech_desc_' + i)}</p>
                </div>
                <motion.div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-700" style={{ width: '0%' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── HOW IT WORKS ──────────────────────────────────── */}
      <Section id="how_it_works" className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 block">{t('steps_badge')}</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('steps_heading')} <span className="text-emerald-500">{t('steps_heading_acc')}</span> {t('steps_subtitle')}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-300 via-emerald-500 to-orange-400" />

          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10 transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: step.color }}>
                <step.icon className="w-9 h-9 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shadow-lg z-20">0{i + 1}</div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── GAMIFICATION SECTION ─────────────────────────────── */}
      <Section className="py-24 bg-gradient-to-br from-emerald-500/5 via-transparent to-orange-500/5 dark:from-emerald-900/10 dark:via-transparent dark:to-orange-900/10 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 block">{t('game_badge')}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{t('game_heading')} <span className="text-emerald-500">{t('game_heading_acc')}</span></h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mb-16">{t('game_subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Coins, titleKey: 'game_col_0_title', itemsKey: 'game_col_0_items', color: '#00A86B' },
              { icon: Award, titleKey: 'game_col_1_title', itemsKey: 'game_col_1_items', color: '#FF6B00' },
              { icon: TreePine, titleKey: 'game_col_2_title', itemsKey: 'game_col_2_items', color: '#10b981' },
            ].map((col, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all text-left"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: col.color }}>
                  <col.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">{t(col.titleKey)}</h3>
                <div className="space-y-3">
                  {t(col.itemsKey).split('|').map((item, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── PARTNER ECOSYSTEM ──────────────────────────────── */}
      <Section id="partners" className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 block">{t('eco_badge')}</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{t('eco_heading')} <span className="text-emerald-500">{t('eco_heading_acc')}</span></h2>
        </motion.div>

        {/* Infinite Marquee */}
        <div className="relative overflow-hidden">
          <motion.div className="flex gap-8" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: 9999, ease: 'linear' }}>
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-4 px-8 py-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group">
                <span className="text-3xl group-hover:scale-110 transition-transform">{p.icon}</span>
                <span className="text-sm font-black text-gray-700 dark:text-slate-300">{p.name}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Ecosystem Map Preview */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-[2rem] p-8 md:p-12 border border-gray-100 dark:border-slate-800 text-center"
        >
          <Globe className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
          <h3 className="text-2xl font-black mb-4">8,102+ {t('eco_node_title')}</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto font-medium mb-8">{t('eco_node_desc')}</p>
          <MagneticButton href="/partner">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest shadow-lg">
              {t('eco_cta')} <ArrowRight className="w-4 h-4" />
            </div>
          </MagneticButton>
        </motion.div>
      </Section>

      {/* ─── DASHBOARD PREVIEW ──────────────────────────────── */}
      <Section className="py-24 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-4 block text-emerald-400">{t('dash_badge')}</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">{t('dash_heading')} <span className="text-emerald-400">{t('dash_heading_acc')}</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium mb-16">{t('dash_subtitle')}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-2xl overflow-hidden text-left"
          >
            {/* Dashboard Top Bar */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {['red', 'yellow', 'green'].map(c => <div key={c} className={`w-3 h-3 rounded-full bg-${c}-500`} style={{ backgroundColor: c }} />)}
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-4">{t('dash_cmd')}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: 9999 }} />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{t('dash_online')}</span>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: t('dash_stat_0'), value: '247', change: '+12%', color: '#00A86B' },
                { label: t('dash_stat_1'), value: '48,290', change: '+8%', color: '#10b981' },
                { label: t('dash_stat_2'), value: '12.4T', change: '+5%', color: '#3b82f6' },
              ].map((d, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{d.label}</p>
                  <p className="text-2xl font-black text-white" style={{ color: d.color }}>{d.value}</p>
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">{d.change}</p>
                  <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: d.color }}
                      initial={{ width: 0 }} whileInView={{ width: `${60 + i * 15}%` }} viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3">{t('dash_heatmap')}</p>
                <div className="grid grid-cols-12 gap-1 h-20">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <motion.div key={i} className="rounded-sm"
                      style={{ backgroundColor: `rgba(16,185,129,${0.1 + ((i * 37 + 13) % 100) * 0.006})` }}
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3">{t('dash_pricing')}</p>
                <div className="flex items-end gap-2 h-20">
                  {[45, 62, 38, 75, 52, 88, 41, 69].map((h, i) => (
                    <motion.div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500 to-emerald-400"
                      initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Glow accents */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      </Section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <Section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-4 block">{t('test_badge')}</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">{t('test_heading')} <span className="text-emerald-500">{t('test_heading_about')}</span> Says</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((tItem, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all relative"
            >
              <Quote className="w-8 h-8 text-emerald-500/20 absolute top-6 right-6" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  {tItem.avatar}
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-sm">{tItem.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{tItem.role}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed">"{tItem.q}"</p>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500">{tItem.credit} {t('test_credit')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <Section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden border border-emerald-500/20 shadow-2xl"
        >
          {/* Background effects */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.05)_0%,_transparent_60%)]" />

          <div className="relative z-10">
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Zap className="w-3 h-3" /> {t('cta_badge')}
            </motion.div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-8 leading-[1.05]">
              {t('cta_heading')}<br />
              <span className="text-emerald-400">{t('cta_heading_acc')}</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium mb-12">
              {t('cta_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton href="/customer">
                <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/30">
                  {t('cta_btn_1')} <ArrowRight className="w-4 h-4" />
                </div>
              </MagneticButton>
              <MagneticButton href="/partner">
                <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">
                  {t('cta_btn_2')} <ExternalLink className="w-4 h-4" />
                </div>
              </MagneticButton>
              <MagneticButton>
                <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm text-slate-300 font-bold text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                  {t('cta_btn_3')} <Globe className="w-4 h-4" />
                </div>
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-white italic">F</span>
                </div>
                <div>
                  <p className="text-lg font-black uppercase">F.R.E.S.H <span className="text-emerald-500">AI</span></p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
                {t('footer_tagline')}
              </p>
            </div>
            {[
              { titleKey: 'footer_col_0', linkKeys: ['footer_link_0', 'footer_link_1', 'footer_link_2', 'footer_link_3'] },
              { titleKey: 'footer_col_1', linkKeys: ['footer_link_4', 'footer_link_5', 'footer_link_6', 'footer_link_7'] },
              { titleKey: 'footer_col_2', linkKeys: ['footer_link_8', 'footer_link_9', 'footer_link_10', 'footer_link_11'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white mb-6">{t(col.titleKey)}</h4>
                <ul className="space-y-3">
                  {col.linkKeys.map((key, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-gray-500 dark:text-slate-400 font-medium hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">{t(key)}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 dark:border-slate-800 gap-4">
            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold tracking-wider uppercase">
              &copy; {new Date().getFullYear()} {t('footer_copyright')}
            </p>
            <div className="flex items-center gap-4">
              {[Mail, Globe, Phone].map((Icon, i) => (
                <motion.a key={i} href="#" whileHover={{ y: -2 }}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ─── Live Counter Component ────────────────────────────────────
function LiveCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { value: count, ref } = useCounter(value, 2000);
  const format = value >= 1000 ? count.toLocaleString() : count;
  return <span ref={ref}>{format}{suffix}</span>;
}

// ─── Play Icon ──────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
    </svg>
  );
}
