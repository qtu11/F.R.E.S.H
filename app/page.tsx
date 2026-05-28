'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { productService, Product } from '@/lib/data/products';
import { applyRescueCatalogImages, rescueProductsToClient } from '@/lib/data/rescue-products';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag, Store, ShieldCheck, ArrowRight, Leaf, Globe, Mail, Phone,
  Sparkles, ChevronDown, Star, Layers, Zap, Users, Shield, Menu, X, Moon, Sun,
  Award, BadgeCheck, Repeat, ScanLine, ChevronRight, ExternalLink, Target, TreePine,
  Wallet, Heart, Clock, Network, MapPin, Settings, Coins, Rocket, Cpu, Eye, BookOpen,
  ArrowUpRight, BarChart3, Database, Lock, AlertTriangle, CheckCircle2, Flame
} from 'lucide-react';

// ─── 1. INTERACTIVE CYBER BACKGROUND (CANVAS API) ───────────────────
function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Hạt năng lượng
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }> = [];

    const colors = ['rgba(16, 185, 129, 0.4)', 'rgba(249, 115, 22, 0.3)', 'rgba(59, 130, 246, 0.3)'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        decay: 0.002
      });
    }

    let mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Vẽ lưới mạng lưới 3D giả lập (cyber matrix grid)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vẽ liên kết plexus hạt
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Tránh biên
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Vẽ hạt
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.fill();

        // Tương tác chuột
        if (mouse.active) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 180)})`;
            ctx.stroke();
          }
        }

        // Vẽ đường nối giữa các hạt gần nhau
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.08 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-80" />;
}

// ─── 2. TEXT SCRAMBLE / GLITCH EFFECT FOR Futurist Feel ──────────────
function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-';

  const triggerGlitch = useCallback(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(prev =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '.' || char === ',') return char;
            if (index < iterations) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (iterations >= text.length) {
        clearInterval(interval);
      }
      iterations += 1 / 2;
    }, 30);
  }, [text, chars]);

  useEffect(() => {
    triggerGlitch();
    const timer = setInterval(triggerGlitch, 8000);
    return () => clearInterval(timer);
  }, [triggerGlitch]);

  return <span className={className}>{displayText}</span>;
}

// ─── 3. INTERACTIVE NEON CORE (ABSTRACT 3D/CSS ENERGY CENTER) ───────
function NeonEnergyCore() {
  return (
    <div className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/20 blur-[100px] animate-pulse" />
      <div className="absolute w-60 h-60 rounded-full bg-orange-500/10 blur-[80px] animate-pulse delay-75" />

      {/* Orbit Rings (3D perspective rotating) */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 border-t-emerald-500/80 border-b-emerald-400/80"
          style={{ transform: 'rotateX(60deg) rotateY(15deg)' }}
        />

        {/* Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[110%] h-[110%] rounded-full border border-orange-500/40 border-l-orange-500 border-r-transparent"
          style={{ transform: 'rotateX(45deg) rotateY(-30deg)' }}
        />

        {/* Ring 3 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[120%] h-[120%] rounded-full border border-dashed border-blue-500/20 border-t-blue-500 border-b-transparent"
          style={{ transform: 'rotateX(75deg) rotateY(45deg)' }}
        />

        {/* Core Node */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)] border border-emerald-300/40"
        >
          <Leaf className="w-8 h-8 text-white mb-1 animate-bounce" />
          <span className="text-[10px] font-black tracking-widest text-emerald-100 uppercase">F.R.E.S.H</span>
          <span className="text-[8px] font-bold text-emerald-200 uppercase tracking-widest">AI CORE</span>
        </motion.div>

        {/* Floating Mini Nodes */}
        {[
          { color: 'bg-emerald-500 shadow-emerald-500/60', delay: 0, x: -100, y: -60, label: 'OCR' },
          { color: 'bg-orange-500 shadow-orange-500/60', delay: 1, x: 110, y: 70, label: 'PRICING' },
          { color: 'bg-blue-500 shadow-blue-500/60', delay: 2, x: 100, y: -90, label: 'ESG' },
          { color: 'bg-emerald-400 shadow-emerald-400/60', delay: 3, x: -90, y: 100, label: 'MAP' }
        ].map((node, i) => (
          <motion.div
            key={i}
            initial={{ x: node.x, y: node.y }}
            animate={{
              y: [node.y - 6, node.y + 6, node.y - 6],
              x: [node.x - 4, node.x + 4, node.x - 4]
            }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
            className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700/50 backdrop-blur-md shadow-md dark:shadow-lg"
          >
            <span className={`w-2 h-2 rounded-full ${node.color} animate-pulse`} />
            <span className="text-[9px] font-black tracking-wider text-slate-600 dark:text-slate-300">{node.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. INTERACTIVE ESG SIMULATOR ──────────────────────────────────
function ESGSimulator() {
  const { t } = useGlobal();
  const [weight, setWeight] = useState(25);
  const co2Reduced = useMemo(() => (weight * 2.5).toFixed(1), [weight]);
  const greenCredits = useMemo(() => Math.floor(weight * 10), [weight]);
  const treesSaved = useMemo(() => (weight * 0.12).toFixed(2), [weight]);

  const items = useMemo(() => [
    { label: t('co2_reduced_label'), val: co2Reduced, unit: ` ${t('co2_saved_unit')}`, desc: t('protect_atmosphere'), icon: Flame, color: 'text-orange-500 bg-orange-500/10' },
    { label: t('green_credits_label'), val: greenCredits, unit: ` ${t('green_credits_unit')}`, desc: t('redeem_rewards'), icon: Coins, color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10' },
    { label: t('trees_saved_label'), val: treesSaved, unit: ` ${t('trees_saved_unit')}`, desc: t('absorb_carbon'), icon: TreePine, color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10' }
  ], [t, co2Reduced, greenCredits, treesSaved]);

  return (
    <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-emerald-500/20 rounded-[2rem] p-6 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:shadow-none relative overflow-hidden group">
      {/* Light glow lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-555 dark:text-emerald-400">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{t('esg_sim_title')}</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">{t('esg_sim_subtitle')}</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 dark:border-emerald-500/30">REALTIME ESG</span>
      </div>

      {/* Selector */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
          <span>{t('food_rescue_amount')}:</span>
          <span className="text-emerald-500 dark:text-emerald-400 text-sm font-black">{weight} kg</span>
        </div>
        <input
          type="range"
          min="1"
          max="200"
          value={weight}
          onChange={(e) => setWeight(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-150 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/50 transition-all flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-1.5 rounded-lg ${item.color}`}>
                <item.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
              <div className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
                {item.val}
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{item.unit}</span>
              </div>
              <p className="text-[8px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-wider mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 5. AI DYNAMIC PRICING SIMULATOR ────────────────────────────────
function PricingSimulator() {
  const { t, lang } = useGlobal();
  const [hoursLeft, setHoursLeft] = useState(12);

  // Thuật toán tính giá động AI
  const originalPrice = 50000;
  const aiPrice = useMemo(() => {
    // Giá giảm dần phi tuyến tính dựa trên hạn sử dụng
    const ratio = hoursLeft / 24; // 0 -> 1
    const factor = 0.3 + 0.7 * Math.pow(ratio, 0.85); // giảm sâu khi cận giờ
    return Math.round(originalPrice * factor);
  }, [hoursLeft]);

  const discountPercent = useMemo(() => {
    return Math.round(((originalPrice - aiPrice) / originalPrice) * 100);
  }, [originalPrice, aiPrice]);

  const formattedOriginalPrice = useMemo(() => {
    return lang === 'vi' ? '50Kđ' : '50k VND';
  }, [lang]);

  const formattedAIPrice = useMemo(() => {
    return lang === 'vi' ? `${(aiPrice / 1000).toFixed(0)}Kđ` : `${(aiPrice / 1000).toFixed(0)}k VND`;
  }, [lang, aiPrice]);

  return (
    <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-orange-500/20 rounded-[2rem] p-6 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:shadow-none relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{t('tech_title_0')}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">{t('ai_pricing_subtitle')}</p>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-orange-500/10 dark:bg-orange-500/20 text-orange-655 dark:text-orange-400 font-bold border border-orange-500/20 dark:border-orange-500/30">AUTOPILOT</span>
        </div>

        {/* Product preview */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-150 dark:border-slate-800/40 flex items-center gap-4 mb-4 shadow-sm dark:shadow-none">
          <div className="w-16 h-16 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center text-3xl shadow-inner border border-slate-250 dark:border-slate-700">
            🍔
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">{t('surplus_rescue_package')}</span>
            <h5 className="text-xs font-black text-slate-800 dark:text-white uppercase">{t('hamburger_combo')}</h5>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xs text-slate-450 line-through font-bold">{formattedOriginalPrice}</span>
              <span className="text-sm text-orange-550 dark:text-orange-400 font-black">{formattedAIPrice}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 font-black">-{discountPercent}%</span>
            </div>
          </div>
        </div>

        {/* Expiry Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>{t('hours_to_expiry')}:</span>
            <span className="text-orange-550 dark:text-orange-400">{hoursLeft} {t('hours_unit')}</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            value={hoursLeft}
            onChange={(e) => setHoursLeft(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800/20 text-center">
        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase block mb-1">{t('demand_hyperlocal')}</span>
        <div className="flex items-end justify-center gap-1.5 h-10">
          {Array.from({ length: 12 }).map((_, idx) => {
            const isTarget = Math.abs(idx - (24 - hoursLeft) / 2) < 2.5;
            return (
              <motion.div
                key={idx}
                animate={{ height: isTarget ? ['35%', '85%', '35%'] : ['15%', '45%', '15%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                className={`w-2 rounded-t-sm ${isTarget ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 6. LIVE RADAR SCREEN ───────────────────────────────────────────
function RadarScreen() {
  const { t, lang } = useGlobal();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setLogs([t('radar_init_log')]);
  }, [t]);

  useEffect(() => {
    const locations = ['WinMart+ Bùi Hữu Nghĩa', 'Circle K UEF Điện Biên Phủ', 'GS25 Ung Văn Khiêm', 'FamilyMart Nguyễn Gia Trí', 'Lotte Mart Quận 7'];
    const productsVi = ['Gói bánh ngọt Pháp', 'Sữa tươi organic', 'Cơm cuộn tam giác', 'Sandwich đùi heo', 'Gói rau sạch salad'];
    const productsEn = ['French Pastry Pack', 'Organic Fresh Milk', 'Triangle Kimbap', 'Ham Sandwich', 'Fresh Salad Pack'];

    const interval = setInterval(() => {
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const productsList = lang === 'vi' ? productsVi : productsEn;
      const randomProd = productsList[Math.floor(Math.random() * productsList.length)];
      const time = new Date().toLocaleTimeString();
      const newLog = `[${time}] ${t('radar_success_log')} ${randomProd} ${t('at')} ${randomLoc}`;

      setLogs(prev => [newLog, ...prev.slice(0, 3)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [lang, t]);

  return (
    <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-blue-500/20 rounded-[2rem] p-6 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:shadow-none relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-650 dark:text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{t('local_rescue_radar')}</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold">Hyperlocal Scanner</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[8px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-black border border-emerald-500/15 dark:border-emerald-500/30">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            {t('live_scan')}
          </span>
        </div>

        {/* Radar Graphic */}
        <div className="relative w-40 h-40 mx-auto my-3 rounded-full border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950/50 shadow-inner">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-blue-500/15 to-transparent animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute w-[70%] h-[70%] rounded-full border border-blue-500/15 dark:border-blue-500/20" />
          <div className="absolute w-[40%] h-[40%] rounded-full border border-blue-500/10 dark:border-blue-500/15" />
          <div className="absolute w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-ping" />
          <span className="absolute top-8 left-12 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="absolute bottom-12 right-16 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
          <span className="absolute top-20 right-8 w-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Terminal log output */}
      <div className="bg-slate-950 dark:bg-black/60 rounded-xl p-3 border border-slate-800 dark:border-slate-800/80 font-mono text-[9px] leading-normal shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] relative group">
        <span className="text-slate-500 dark:text-slate-600 block mb-1 font-black uppercase tracking-wider">{t('live_system_log')}</span>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="truncate text-slate-300 dark:text-slate-400">
              <span className={log.includes('SYS') ? 'text-blue-400 dark:text-blue-300 font-semibold' : 'text-emerald-500 dark:text-emerald-400 font-semibold'}>{log.slice(0, 8)}</span>
              <span className="ml-1.5">{log.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 7. THEMES & NAV DATA ───────────────────────────────────────────
const PARTNERS = [
  { name: 'WinMart+', icon: '🏪' }, { name: 'GS25', icon: '🏬' }, { name: 'Circle K', icon: '🛒' },
  { name: 'AEON Mall', icon: '🏢' }, { name: 'Co.opmart', icon: '🛍️' }, { name: 'FamilyMart', icon: '🏪' },
  { name: 'Lotte Mart', icon: '🏬' }, { name: 'MM Mega Market', icon: '🏪' },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE LANDING
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const { t, theme, setTheme, lang, setLang } = useGlobal();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);
  const mainRef = useRef<HTMLDivElement>(null);

  const catalogProducts = useMemo(() => rescueProductsToClient(), []);

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRescueProduct, setSelectedRescueProduct] = useState<Product | null>(null);
  const [showQuickRescueModal, setShowQuickRescueModal] = useState(false);

  useEffect(() => {
    setLoadingProducts(true);
    productService.getLive()
      .then((data) => {
        setDbProducts(data || []);
      })
      .catch((err) => {
        console.error('Error fetching live products on landing page:', err);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  const displayProducts = useMemo(() => {
    const hasRescueCatalog = dbProducts.some((p) => p.id.startsWith('rp'));
    // Filter out old seed trash products starting with 'p' (but keep 'rp' and UUIDs)
    const baseProducts = hasRescueCatalog 
      ? dbProducts.filter((p) => !p.id.startsWith('p') || p.id.startsWith('rp')) 
      : catalogProducts;
    const withImages = applyRescueCatalogImages(baseProducts) as typeof baseProducts;
    if (categoryFilter === 'All') return withImages;
    return withImages.filter((p) => p.category === categoryFilter);
  }, [dbProducts, catalogProducts, categoryFilter]);

  const getExpiryLabelLanding = (expiryStr: string) => {
    const rem = new Date(expiryStr).getTime() - Date.now();
    if (rem <= 0) return { text: lang === 'vi' ? 'Hết hạn' : 'Expired', style: 'text-red-500 bg-red-500/10 border-red-500/20' };
    const hrs = Math.round(rem / (60 * 60 * 1000));
    if (hrs <= 24) {
      return {
        text: lang === 'vi' ? (hrs <= 4 ? `Chỉ còn ${hrs}h!` : 'Sắp hết hạn') : (hrs <= 4 ? `${hrs}h left!` : 'Expiring soon'),
        style: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse',
      };
    }
    const days = Math.round(hrs / 24);
    return {
      text: lang === 'vi' ? `Còn hạn · ${days} ngày` : `Fresh · ${days}d left`,
      style: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
  };

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

  const navLinks = useMemo(() => [
    { label: t('nav_about'), id: 'about' },
    { label: t('nav_technology'), id: 'technology' },
    { label: t('nav_network'), id: 'network' },
    { label: t('explore_portals'), id: 'portals' },
    { label: t('community_feedback'), id: 'testimonials' }
  ], [t]);

  const testimonials = useMemo(() => [
    { name: t('testimonial_name_1'), role: t('testimonial_role_1'), q: t('testimonial_quote_1'), avatar: 'MT', credits: 2850 },
    { name: t('testimonial_name_2'), role: t('testimonial_role_2'), q: t('testimonial_quote_2'), avatar: 'LV', credits: 1940 },
    { name: t('testimonial_name_3'), role: t('testimonial_role_3'), q: t('testimonial_quote_3'), avatar: 'MH', credits: 3420 }
  ], [t]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main ref={mainRef} className="min-h-screen relative bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-white overflow-x-hidden selection:bg-emerald-500/30 selection:text-white transition-colors duration-500">

      {/* Dynamic Mouse Glow Spotlight */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-90 dark:opacity-45 transition-opacity duration-500" 
        style={{
          background: 'radial-gradient(circle 800px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), rgba(16, 185, 129, 0.07), rgba(59, 130, 246, 0.02) 50%, transparent 80%)'
        }} 
      />
      
      {/* 1. Cyber Dynamic Background Grid */}
      <CyberBackground />

      {/* Decorative Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-gradient-to-tl from-orange-500/5 via-transparent to-transparent rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] left-[25%] w-[35vw] h-[35vw] bg-gradient-to-r from-blue-500/5 via-transparent to-transparent rounded-full blur-[120px]" />
      </div>

      {/* ─── NAVBAR (Ultra Glassmorphism) ────────────────────────── */}
      <motion.header
        style={{ opacity: navOpacity }}
        className={`fixed top-4 inset-x-4 z-50 mx-auto max-w-7xl rounded-2xl border transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-2xl'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-transform group-hover:scale-105 duration-300">
              <span className="text-2xl font-black text-white italic tracking-tighter">F</span>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950"
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase flex items-center gap-1.5 text-slate-900 dark:text-white">
                F.R.E.S.H <span className="text-emerald-400 text-xs px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30">AI</span>
              </h1>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] font-extrabold">Rescue · ESG · Hyperlocal</p>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-655 dark:text-slate-300">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="px-4 py-2.5 rounded-xl hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300 relative group"
              >
                {link.label}
                <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </a>
            ))}
          </nav>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Unified Settings Pill (Desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 p-1 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm backdrop-blur-md relative">
              {/* Language selection: sliding pills */}
              <div className="flex items-center bg-slate-200/60 dark:bg-slate-950/80 rounded-full p-0.5 relative">
                <button
                  onClick={() => setLang('vi')}
                  className={`relative px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
                    lang === 'vi' ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  VI
                  {lang === 'vi' && (
                    <motion.div
                      layoutId="activeLang"
                      className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`relative px-2.5 py-1 text-[9px] font-black tracking-wider rounded-full transition-colors duration-300 z-10 cursor-pointer ${
                    lang === 'en' ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  EN
                  {lang === 'en' && (
                    <motion.div
                      layoutId="activeLang"
                      className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="relative w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-950/80 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-inner overflow-hidden cursor-pointer"
                title={theme === 'light' ? t('switch_dark') : t('switch_light')}
              >
                <motion.div
                  animate={{ rotate: theme === 'light' ? 0 : 180, scale: theme === 'light' ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Moon className="w-4 h-4 text-slate-700" />
                </motion.div>
                <motion.div
                  animate={{ rotate: theme === 'light' ? -180 : 0, scale: theme === 'light' ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              </button>
            </div>

            {/* Launch System */}
            {user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/customer'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-102 transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-bold text-white">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <span>{lang === 'en' ? 'PORTAL' : 'VÀO PORTAL'}</span>
              </Link>
            ) : (
              <Link
                href="/customer"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-102 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
                {t('login_btn')}
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-355 hover:text-slate-900 dark:hover:text-white"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950"
            >
              <div className="px-6 py-5 space-y-4">
                {navLinks.map(link => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-2" />
                
                {/* Unified Settings Pill (Mobile Nav) */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 shadow-inner">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('settings_prefs')}:</span>
                  
                  <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-emerald-500/20 rounded-full shadow-sm relative">
                    {/* Lang selection */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 relative">
                      <button
                        onClick={() => setLang('vi')}
                        className={`relative px-2.5 py-1 text-[8px] font-black rounded-full transition-colors duration-300 z-10 cursor-pointer ${
                          lang === 'vi' ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        VI
                        {lang === 'vi' && (
                          <motion.div
                            layoutId="activeLangMob"
                            className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      <button
                        onClick={() => setLang('en')}
                        className={`relative px-2.5 py-1 text-[8px] font-black rounded-full transition-colors duration-300 z-10 cursor-pointer ${
                          lang === 'en' ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        EN
                        {lang === 'en' && (
                          <motion.div
                            layoutId="activeLangMob"
                            className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    </div>

                    <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-850" />

                    {/* Theme select */}
                    <button
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className="relative w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    >
                      {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>
                </div>

                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/customer'}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 text-center shadow-lg shadow-emerald-500/25"
                  >
                    {lang === 'en' ? 'PORTAL' : 'VÀO HỆ THỐNG'}
                  </Link>
                ) : (
                  <Link
                    href="/customer"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 text-center shadow-lg shadow-emerald-500/25"
                  >
                    {t('login_btn')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── HERO SECTION (Text Masking & Energy Core) ──────────── */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
        {/* Subtle Cyber Grid Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Hero Content) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{t('hero_badge')}</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">{t('hero_heading_1')}</span>
              <br />
              <span className="text-gradient">{t('hero_heading_2')}</span>
            </h1>

            {/* Subheading */}
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl font-medium leading-relaxed mb-8">
              {t('hero_subtitle')}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/customer"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:scale-102 hover:shadow-emerald-500/50 transition-all cursor-pointer"
              >
                {t('launch_ecosystem')}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/startup"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {t('learn_project')}
              </Link>
            </div>
          </div>

          {/* Right Column (Abstract Core Animation) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <NeonEnergyCore />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{t('scroll_explore')}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-slate-400">
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </section>

      {/* ─── LIVE METRIC PANEL (Futuristic Dashboard) ──────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-24">
        <div className="p-8 rounded-[2.5rem] bg-white/75 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl shadow-slate-100/50 dark:shadow-none relative group overflow-hidden transition-all duration-500 hover:border-emerald-500/30">
          {/* Animated decorative green light inside metric panel */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center relative z-10">
            {[
              { label: t('food_rescued_stat'), value: '1,248,392', unit: ' KG', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: t('co2_reduction_stat'), value: '418,500', unit: ' KG', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: t('active_nodes_stat'), value: '8,102', unit: ` ${lang === 'vi' ? 'C.HẰNG' : 'STORES'}`, color: 'text-blue-600 dark:text-blue-400' },
              { label: t('ai_confidence'), value: '97.4', unit: ' %', color: 'text-orange-600 dark:text-orange-400' },
              { label: t('about_rescuers'), value: '45,289', unit: ' USER', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: t('green_credits_upper'), value: '94.8', unit: ' /100', color: 'text-blue-600 dark:text-blue-400' }
            ].map((stat, i) => (
              <div key={i} className="group/item relative py-2 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-300">
                <span className="text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-widest font-black block mb-2">{stat.label}</span>
                <p className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${stat.color}`}>
                  {stat.value}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{stat.unit}</span>
                </p>
                <div className="w-0 h-0.5 bg-emerald-500 mx-auto mt-2.5 group-hover/item:w-1/2 transition-all duration-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT SECTION (Dẫn đầu cuộc cách mạng) ───────────────── */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-800/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Graphic block Left */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-100/50 dark:shadow-2xl">
              {/* Green credits list mock */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">{t('achievement_badges')}</span>
                <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-bold uppercase">{t('newly_received')}</span>
              </div>
              <div className="space-y-3">
                {[
                  { badge: '🌱', title: t('achievement_starter_title'), reward: '+100 Credits', date: t('just_now') },
                  { badge: '🌍', title: t('achievement_warrior_title'), reward: '+250 Credits', date: `2 ${t('minutes_ago')}` },
                  { badge: '♻️', title: t('achievement_ambassador_title'), reward: '+500 Credits', date: `10 ${t('minutes_ago')}` }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.badge}</span>
                      <div>
                        <h6 className="text-xs font-black text-slate-800 dark:text-white uppercase">{item.title}</h6>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{item.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-555 dark:text-emerald-400">{item.reward}</span>
                  </div>
                ))}
              </div>

              {/* Glowing ring back */}
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>

          {/* Content Block Right */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-3">{t('about_badge')}</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase leading-tight tracking-tight mb-6">
              {t('about_heading')} <span className="text-emerald-400">{t('about_heading_acc')}</span> {t('about_heading_tail')}
            </h2>
            <div className="space-y-5 text-slate-400 text-sm md:text-base font-medium leading-relaxed">
              <p>
                {t('about_p1')}
              </p>
              <p>
                {t('about_p2')}
              </p>
              <p>
                {t('about_p3')}
              </p>
            </div>

            {/* Quick stats inline */}
            <div className="flex gap-8 mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 w-full">
              {[
                { value: t('stats_wasted_val'), label: t('stats_wasted_yr'), color: 'text-orange-400' },
                { value: t('stats_reduction_val'), label: t('stats_waste_reduction'), color: 'text-emerald-400' },
                { value: t('stats_co2_val'), label: t('stats_co2_reduced'), color: 'text-blue-400' }
              ].map((s, idx) => (
                <div key={idx}>
                  <p className={`text-lg md:text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGY SECTION (BENTO GRID) ────────────────────── */}
      <section id="technology" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-800/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-400 mb-3 block">{t('tech_badge')}</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {t('tech_heading')} <span className="text-gradient">{t('tech_heading_acc')}</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm font-medium mt-4">
            {t('tech_subtitle')}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Box 1 (AI Pricing Simulator) */}
          <div className="lg:col-span-7">
            <PricingSimulator />
          </div>

          {/* Box 2 (Radar local scanner) */}
          <div className="lg:col-span-5">
            <RadarScreen />
          </div>

          {/* Box 3 (ESG Live Simulator) */}
          <div className="lg:col-span-5">
            <ESGSimulator />
          </div>

          {/* Box 4 (OCR Scanner details) */}
          <div className="lg:col-span-7 bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-8 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden group shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-md">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 w-fit mb-4">
                  <ScanLine className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">{t('tech_title_3')}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {t('ocr_desc')}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center w-full md:w-44 shadow-inner flex flex-col items-center justify-center">
                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase block mb-2">{t('scanning_module')}</span>
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full border-2 border-emerald-500/20 flex items-center justify-center relative overflow-hidden mb-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-500/10 to-transparent animate-pulse" />
                  <ScanLine className="w-8 h-8 text-emerald-555 dark:text-emerald-400" />
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{t('waiting_load')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NETWORK & MAP (Mạng lưới cứu hộ) ───────────────────── */}
      <section id="network" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-3">{t('partner_network_title')}</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-6">
              {t('partner_heading')} <span className="text-emerald-400">{t('partner_heading_acc')}</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
              {t('partner_network_desc')}
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              {[
                { count: '8,102+', label: t('stats_coverage') },
                { count: '100%', label: t('stats_realtime_api') },
                { count: `0.8 ${t('seconds_unit')}`, label: t('stats_latency') },
                { count: '4.8★', label: t('stats_app_rating') }
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm dark:shadow-none">
                  <p className="text-xl font-black text-slate-850 dark:text-white">{item.count}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-wider mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <Link
              href="/partner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-705 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
            >
              {t('btn_become_partner')}
              <ArrowRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </Link>
          </div>

          {/* Map Preview Graphic */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-205 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50 dark:shadow-2xl relative overflow-hidden text-center">
              {/* Map grid lines */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `radial-gradient(circle, rgba(16,185,129,0.3) 1.5px, transparent 1.5px)`,
                backgroundSize: '20px 20px',
              }} />
              
              <Globe className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-6 animate-pulse" />
              <h4 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-wider mb-2">{t('hyperlocal_infrastructure')}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-sm mx-auto">
                {t('heatmap_desc')}
              </p>

              {/* Connected Nodes */}
              <div className="mt-8 flex justify-center gap-2.5">
                {['Q.1', 'Q.3', 'Q.Bình Thạnh', 'Q.Thủ Đức', 'Q.7'].map((dist, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 text-[9px] text-slate-600 dark:text-slate-400 font-bold shadow-inner">
                    ⬤ {dist}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INFINITE MARQUEE (Đối tác liên kết) ────────────────── */}
      <section className="py-12 bg-emerald-50/20 dark:bg-slate-950/50 border-y border-slate-200 dark:border-slate-900/80 overflow-hidden relative z-10">
        <div className="relative w-full overflow-hidden flex">
          <div className="animate-marquee-infinite flex gap-8 pr-8">
            {[...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
              <div
                key={i}
                className="group flex items-center gap-4.5 px-8 py-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-sm dark:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900/95 hover:border-emerald-500 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] dark:hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-120 group-hover:rotate-6 transition-transform duration-300">{p.icon}</span>
                <span className="text-xs font-black text-slate-600 dark:text-slate-300 group-hover:text-emerald-555 dark:group-hover:text-emerald-400 uppercase tracking-widest transition-colors duration-300">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE RESCUE FEED (Danh sách sản phẩm cứu hộ) ────────── */}
      <section id="rescue-feed" className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-b border-slate-200/60 dark:border-slate-900/60">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-555 dark:text-emerald-400 mb-3 block">
            {t('landing_products_badge')}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-3">
            {t('landing_products_heading')} <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm font-semibold mt-4">
            {t('landing_products_sub')}
          </p>
        </div>

        {/* Categories selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: 'All', name: lang === 'vi' ? 'Tất cả' : 'All' },
            { id: 'Vegetables', name: lang === 'vi' ? 'Rau củ' : 'Vegetables' },
            { id: 'Fruits', name: lang === 'vi' ? 'Trái cây' : 'Fruits' },
            { id: 'Produce', name: lang === 'vi' ? 'Thịt & hải sản' : 'Meat & seafood' },
            { id: 'Dairy', name: lang === 'vi' ? 'Sữa & trứng' : 'Dairy' },
            { id: 'Bakery', name: lang === 'vi' ? 'Bánh ngọt' : 'Bakery' },
            { id: 'Meals', name: lang === 'vi' ? 'Chế biến sẵn' : 'Prepared meals' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                categoryFilter === cat.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white dark:bg-slate-900/40 border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayProducts.map((item) => {
              const exp = getExpiryLabelLanding(item.expiry);
              const isExpired = exp.text === 'Hết hạn' || exp.text === 'Expired';
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-xl dark:hover:shadow-emerald-950/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Expiry and Discount badges */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase tracking-wider ${exp.style}`}>
                        {exp.text}
                      </span>
                      <span className="text-[10px] bg-orange-500 text-white font-mono px-2 py-0.5 rounded font-black">
                        -{item.discount}%
                      </span>
                    </div>

                    {/* Image and basic info */}
                    <div className="flex items-center gap-4 mt-5">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shadow-inner border border-slate-250 dark:border-slate-700 shrink-0 overflow-hidden select-none group-hover:rotate-12 transition-transform duration-300">
                        {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{item.image || '🥦'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-850 dark:text-white text-base block line-clamp-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" /> {item.storeName}
                        </span>
                        {item.distance && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5 ml-4.5">
                            {item.distance} {lang === 'vi' ? 'km gần đây' : 'km nearby'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CO2 Saved and Stock */}
                  <div className="mt-5 flex justify-between items-center bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 rounded-xl px-4 py-2 text-xs">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" />
                      {t('eco_saved_tag').replace('{co2}', item.co2Saved?.toString() || '0')}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      {t('only_left').replace('{stock}', item.stock.toString())}
                    </span>
                  </div>

                  {/* Prices and Rescue CTA button */}
                  <div className="mt-5 border-t border-slate-200/80 dark:border-slate-850 pt-4 flex justify-between items-center">
                    <div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-550 uppercase font-bold tracking-wider">{t('rescue_price')}</div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-black text-slate-850 dark:text-white font-mono">{item.aiPrice.toLocaleString()}đ</span>
                        <span className="text-xs line-through text-slate-400 dark:text-slate-500 font-mono">{item.originalPrice.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRescueProduct(item);
                        setShowQuickRescueModal(true);
                      }}
                      disabled={item.stock <= 0 || isExpired}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/10 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> {t('rescue_now')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ─── SYSTEM PORTALS (Các cổng thông tin chính) ───────────── */}
      <section id="portals" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-555 dark:text-emerald-400 mb-3 block">{t('explore_portals')}</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {t('explore_portals_heading')} <span className="text-emerald-400">{lang === 'vi' ? 'cứu hộ' : 'rescue'}</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm font-medium mt-4">
            {t('explore_portals_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: t('consumer_portal'),
              desc: t('consumer_desc'),
              path: '/customer',
              glow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/40',
              accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              icon: ShoppingBag,
              btnBg: 'bg-emerald-500 hover:bg-emerald-600 text-white'
            },
            {
              title: t('merchant_hub'),
              desc: t('partner_portal_desc'),
              path: '/partner',
              glow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:border-blue-500/40',
              accent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              icon: Store,
              btnBg: 'bg-blue-500 hover:bg-blue-600 text-white'
            },
            {
              title: t('admin_console'),
              desc: t('admin_portal_desc'),
              path: '/admin',
              glow: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] hover:border-orange-500/40',
              accent: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
              icon: ShieldCheck,
              btnBg: 'bg-orange-500 hover:bg-orange-600 text-white'
            }
          ].map((portal, i) => (
            <div
              key={i}
              className={`bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between backdrop-blur-xl transition-all duration-500 shadow-xl shadow-slate-100/50 dark:shadow-none ${portal.glow}`}
            >
              <div>
                <div className={`p-3 rounded-2xl w-fit border mb-6 ${portal.accent}`}>
                  <portal.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-855 dark:text-white uppercase mb-3">{portal.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium mb-8">{portal.desc}</p>
              </div>

              <Link
                href={portal.path}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all ${portal.btnBg}`}
              >
                {t('enter_portal')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS (Đánh giá từ cộng đồng) ────────────────── */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-800/50">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-555 dark:text-emerald-400 mb-3 block">{t('community_feedback')}</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {t('feedback_heading')} <span className="text-gradient">F.R.E.S.H</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((tItem, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-[2rem] p-8 hover:border-slate-350 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between relative shadow-xl shadow-slate-100/50 dark:shadow-none"
            >
              <span className="text-slate-200 dark:text-slate-700 text-6xl absolute top-4 right-6 font-serif select-none pointer-events-none">“</span>
              
              <div>
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black">
                    {tItem.avatar}
                  </div>
                  <div>
                    <h6 className="text-sm font-black text-slate-800 dark:text-white uppercase">{tItem.name}</h6>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">{tItem.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium italic mb-6">
                  &quot;{tItem.q}&quot;
                </p>
              </div>

              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">{tItem.credits} {t('green_credits_upper')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CYBER CTA (Kêu gọi hành động) ────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-[3rem] p-12 md:p-20 text-center border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          {/* Accent light grids */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] mb-6">
              <Zap className="w-3 h-3" /> {t('join_green_movement')}
            </span>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase leading-none tracking-tight text-white mb-6">
              {t('sustainable_commerce_heading')}<br />
              <span className="text-gradient">{t('sustainable_commerce_heading_acc')}</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-xs md:text-sm font-medium leading-relaxed mb-10">
              {t('cta_description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/customer"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:scale-102 transition-all cursor-pointer"
              >
                {t('btn_join_now')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/partner"
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
              >
                {t('btn_partner_coop')}
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-emerald-950/20 dark:border-slate-900 bg-[#091512] dark:bg-[#030712]/90 backdrop-blur-md overflow-hidden">
        {/* Glow Line Top */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        {/* Decorative Green Orb */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                  <span className="text-xl font-black text-white italic">F</span>
                </div>
                <h4 className="text-sm font-black uppercase text-white tracking-wider">F.R.E.S.H AI</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-xs">
                {t('footer_desc')}
              </p>
            </div>

            {[
              { title: t('footer_portals'), links: [{ label: t('portal_customer'), path: '/customer' }, { label: t('portal_partner'), path: '/partner' }, { label: t('portal_admin'), path: '/admin' }] },
              { title: t('footer_tech'), links: [{ label: t('tech_pricing'), path: '#' }, { label: t('tech_ocr'), path: '#' }, { label: t('tech_esg'), path: '#' }] },
              { title: t('footer_links'), links: [{ label: t('link_uef'), path: '/startup' }, { label: t('link_support'), path: '#' }, { label: t('link_terms'), path: '#' }] }
            ].map((col, idx) => (
              <div key={idx}>
                <h5 className="text-[10px] font-black uppercase text-slate-350 dark:text-slate-300 tracking-wider mb-5">{col.title}</h5>
                <ul className="space-y-3 text-xs text-slate-400 font-medium">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link href={link.path} className="hover:text-emerald-400 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-emerald-950/30 dark:border-slate-900/80 gap-4">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} F.R.E.S.H Platform.
            </p>
            <div className="flex items-center gap-3">
              {[Mail, Globe, Phone].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-emerald-950/30 dark:bg-slate-900 border border-emerald-900/30 dark:border-slate-800/80 flex items-center justify-center text-slate-450 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      {/* ─── QUICK RESCUE LOGIN DIALOG MODAL ────────────────────── */}
      <AnimatePresence>
        {showQuickRescueModal && selectedRescueProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-850 dark:text-white text-base flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" /> {t('quick_rescue_title')}
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">F.R.E.S.H AI Secure Rescue Portal</p>
                </div>
                <button 
                  onClick={() => setShowQuickRescueModal(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Product Preview Info */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-850 shrink-0 overflow-hidden select-none">
                    {selectedRescueProduct.image && (selectedRescueProduct.image.startsWith('http') || selectedRescueProduct.image.startsWith('/')) ? (
                      <img src={selectedRescueProduct.image} alt={selectedRescueProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{selectedRescueProduct.image || '🥦'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-white text-sm line-clamp-1">{selectedRescueProduct.name}</h4>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">{selectedRescueProduct.storeName}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-black text-emerald-500 font-mono">{selectedRescueProduct.aiPrice.toLocaleString()}đ</span>
                      <span className="text-[10px] line-through text-slate-400 dark:text-slate-500 font-mono">{selectedRescueProduct.originalPrice.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {t('quick_rescue_desc')}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/customer"
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    <Users className="w-4 h-4" /> {lang === 'vi' ? 'Đăng nhập KH' : 'Customer Log In'}
                  </Link>
                  <Link
                    href="/partner"
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <Store className="w-4 h-4" /> {lang === 'vi' ? 'Cổng Đối Tác' : 'Partner Portal'}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
