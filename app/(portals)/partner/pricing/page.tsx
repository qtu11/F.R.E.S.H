'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap, TrendingUp, BarChart3, Info, PlayCircle, Settings, PauseCircle, ArrowUp, ArrowDown, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { productService, Product } from '@/lib/data/products';
import { showToast } from '@/lib/data/notifications';

interface PriceItem {
  id: string;
  name: string;
  originalPrice: number;
  aiPrice: number;
  confidence: number | null;
  expiryHours: number;
  demand: string | null;
  trend: string | null;
  stock: number;
}

function mapToPriceItem(p: Product): PriceItem {
  const expiryDate = p.expiry ? new Date(p.expiry) : new Date();
  const now = new Date();
  const expiryHours = Math.max(0, Math.round((expiryDate.getTime() - now.getTime()) / 3600000));
  return {
    id: p.id,
    name: p.name,
    originalPrice: p.originalPrice,
    aiPrice: p.aiPrice,
    confidence: p.rescuedScore ?? null,
    expiryHours,
    demand: null,
    trend: null,
    stock: p.stock,
  };
}

function ExpiryBar({ hours }: { hours: number }) {
  const { t } = useGlobal();
  const pct = Math.min((hours / 24) * 100, 100);
  const isUrgent = hours <= 3;
  const isWarning = hours <= 6 && hours > 3;
  const color = isUrgent ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500';
  const textColor = isUrgent ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400';
  const bgColor = isUrgent ? 'bg-red-100 dark:bg-red-900/30' : isWarning ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30';

  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-3.5 h-3.5 ${textColor}`} />
      <div className="flex-1">
        <div className={`w-full ${bgColor} rounded-full h-1.5 overflow-hidden`}>
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className={`text-[10px] font-bold ${textColor} whitespace-nowrap`}>
        {hours <= 1 ? `<1h` : `${hours}h`}
      </span>
    </div>
  );
}

export default function PartnerPricing() {
  const { t, lang } = useGlobal();
  const { user } = useAuth();
  const [autoPilot, setAutoPilot] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const storeId = user?.storeId || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    productService.getByStore(storeId).then(data => {
      setPriceItems((data || []).filter(p => p.status === 'live').map(mapToPriceItem));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [storeId]);

  const handleToggleAutoPilot = () => {
    setAutoPilot(!autoPilot);
    showToast(autoPilot ? 'warning' : 'success', autoPilot ? 'Auto-Pilot Disabled' : 'Auto-Pilot Enabled', autoPilot ? 'AI pricing paused' : 'AI pricing is now active');
  };

  const chartData = useMemo(() => {
    const sorted = [...priceItems].sort((a, b) => a.expiryHours - b.expiryHours);
    return sorted.slice(0, 6).map((item, i) => ({
      hour: `${8 + i * 2}:00`.padStart(5, '0'),
      aiPrice: item.aiPrice,
      fixedPrice: item.originalPrice,
      sales: Math.max(1, item.stock * (i + 1)),
    }));
  }, [priceItems]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.aiPrice * d.sales, 0);
  const fixedRevenue = chartData.reduce((sum, d) => sum + d.fixedPrice * d.sales, 0);
  const revenueLift = fixedRevenue > 0 ? ((totalRevenue - fixedRevenue) / fixedRevenue * 100).toFixed(1) : '0.0';
  const validConfidences = priceItems.filter(p => p.confidence != null).map(p => p.confidence as number);
  const avgConfidence = validConfidences.length > 0 ? Math.round(validConfidences.reduce((sum, c) => sum + c, 0) / validConfidences.length) : null;

  const chartPaths = useMemo(() => {
    if (chartData.length < 2) return { ai: 'M 0 35 L 100 5', fixed: 'M 0 35 L 100 35' };
    const maxPrice = Math.max(...chartData.flatMap(d => [d.aiPrice, d.fixedPrice]), 1);
    const vbH = 40;
    const pad = 5;
    const range = vbH - pad * 2;
    const step = 100 / (chartData.length - 1);
    const toPath = (key: 'aiPrice' | 'fixedPrice') =>
      chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(vbH - pad - (d[key] / maxPrice) * range).toFixed(1)}`).join(' ');
    return { ai: toPath('aiPrice'), fixed: toPath('fixedPrice') };
  }, [chartData]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <div className="text-gray-900 dark:text-white text-sm font-medium">Loading pricing data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-slate-950 min-h-screen pb-20 font-sans transition-colors duration-300">
      <div className="bg-[#057A42] dark:bg-emerald-900 pt-12 pb-24 px-4 md:rounded-b-[40px] shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-300" /> {t('pricing')}
            </h1>
            <p className="text-white/70 text-sm mt-1">Real-time dynamic pricing powered by AI.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-white/20 dark:border-slate-700">
            <button onClick={handleToggleAutoPilot} className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${autoPilot ? 'bg-white dark:bg-slate-800 text-[#057A42] dark:text-emerald-400' : 'bg-transparent text-white'}`}>
              <PlayCircle className="w-4 h-4" /> {t('auto_pilot')}
            </button>
            <button onClick={handleToggleAutoPilot} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${!autoPilot ? 'bg-white dark:bg-slate-800 text-orange-500' : 'text-white hover:bg-white/10'}`}>
              <PauseCircle className="w-4 h-4" /> {t('cancel')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Info className="w-4 h-4 text-gray-300 dark:text-slate-600" />
            </div>
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{t('sales_prediction')}</div>
            <div className="text-black dark:text-white font-black text-3xl">+{revenueLift}% <span className="text-xs text-green-500 font-bold ml-1">{lang === 'vi' ? 'Tăng' : 'Lift'}</span></div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Info className="w-4 h-4 text-gray-300 dark:text-slate-600" />
            </div>
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{t('ai_confidence')}</div>
            <div className="text-black dark:text-white font-black text-3xl">{avgConfidence != null ? `${avgConfidence}%` : '\u2014'}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <Info className="w-4 h-4 text-gray-300 dark:text-slate-600" />
            </div>
            <div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">{lang === 'vi' ? 'Tối ưu hóa' : 'Optimizations'}</div>
            <div className="text-black dark:text-white font-black text-3xl">{priceItems.length}</div>
          </div>
        </div>

        {/* Per-Item AI Pricing Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> {lang === 'vi' ? 'Giá AI theo sản phẩm' : 'AI Price per Product'}
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {priceItems.map((item, i) => {
              const discount = Math.round((1 - item.aiPrice / item.originalPrice) * 100);
              const isUrgent = item.expiryHours <= 3;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 ${selectedItem === item.id ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}
                  onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</span>
                        {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      </div>
                      <ExpiryBar hours={item.expiryHours} />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-slate-500 line-through">{item.originalPrice.toLocaleString()}đ</span>
                        <span className="text-lg font-black text-[#057A42] dark:text-emerald-400">{item.aiPrice.toLocaleString()}đ</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">-{discount}%</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{item.confidence != null ? `${item.confidence}% AI` : '\u2014'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedItem === item.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{t('stock')}</div>
                        <div className="text-lg font-black text-gray-900 dark:text-white">{item.stock}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{lang === 'vi' ? 'Nhu cầu' : 'Demand'}</div>
                        <div className="text-sm font-black text-gray-400">
                          {item.demand ?? '\u2014'}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{lang === 'vi' ? 'Xu hướng' : 'Trend'}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-gray-400">
                            {item.trend ?? '\u2014'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{t('ai_confidence')}</div>
                        <div className="flex items-center gap-1">
                          {item.confidence != null ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : null}
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{item.confidence != null ? `${item.confidence}%` : '\u2014'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 min-h-[400px] flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-black dark:text-white font-bold text-lg tracking-tight uppercase">{t('revenue_chart')}</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                <div className="w-3 h-3 bg-[#057A42] rounded-full" /> {lang === 'vi' ? 'Giá AI' : 'AI Price'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                <div className="w-3 h-3 bg-gray-200 dark:bg-slate-600 rounded-full" /> {lang === 'vi' ? 'Giá cố định' : 'Fixed Price'}
              </span>
            </div>
          </div>

          <div className="relative flex-1 border-l-2 border-b-2 border-gray-100 dark:border-slate-700 mt-4 mb-8">
            <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d={chartPaths.ai} fill="none" stroke="#057A42" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d={chartPaths.fixed} fill="none" stroke="#e2e8f0" strokeWidth="0.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
            </svg>
            <div className="absolute inset-0 flex justify-around items-end pt-4 pb-1">
              {chartData.map((d, i) => (
                <div key={i} className="group relative flex flex-col items-center">
                  <div className="w-2 h-2 bg-[#057A42] rounded-full shadow-[0_0_8px_rgba(5,122,66,0.5)] cursor-pointer hover:scale-150 transition-transform" />
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-black dark:bg-slate-900 text-white px-2 py-1 rounded text-[10px] transition-transform whitespace-nowrap z-20">
                    {d.aiPrice.toLocaleString()}đ × {d.sales}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between px-2 text-[10px] font-bold text-gray-400 dark:text-slate-500">
            <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 text-sm font-bold text-[#057A42] dark:text-emerald-400">
              <Settings className="w-4 h-4" /> {lang === 'vi' ? 'Trạng thái giá AI' : 'AI Pricing Status'}
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {autoPilot
                ? lang === 'vi'
                  ? 'AI tự động điều chỉnh giá dựa trên nhu cầu, hạn sử dụng và tồn kho. Giá động đang chạy tối ưu.'
                  : 'AI is automatically adjusting prices based on demand, expiry, and inventory levels. Dynamic pricing is running at optimal efficiency.'
                : lang === 'vi'
                  ? 'Tự động AI đã tạm dừng. Giá giữ nguyên giá trị đề xuất cuối. Bật lại để tối ưu.'
                  : 'AI auto-pilot is paused. Prices remain at last suggested values. Enable auto-pilot for optimal pricing.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
