'use client';

import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Clock, Leaf, AlertTriangle, Activity, ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { Product } from '@/lib/data/products';
import { buttonTap } from '@/lib/animation';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRescue: (product: Product) => Promise<void>;
  rescuingId: string | null;
  walletBalance: number;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onRescue,
  rescuingId,
  walletBalance
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  // Helpers
  const getExpiryLabel = (expiryStr: string) => {
    const rem = new Date(expiryStr).getTime() - Date.now();
    if (rem <= 0) return { text: 'Đã hết hạn', style: 'text-red-500 bg-red-500/10 border-red-500/20' };
    const hrs = Math.round(rem / (60 * 60 * 1000));
    if (hrs <= 4) return { text: `Chỉ còn ${hrs}h!`, style: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse font-black' };
    return { text: `${hrs} giờ nữa`, style: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  };

  const exp = getExpiryLabel(product.expiryDate || product.expiry);
  const isExpired = exp.text === 'Đã hết hạn';
  const totalCost = product.aiPrice + 7000; // Price + shipping/service fees
  const isBalanceEnough = walletBalance >= totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col transition-all"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-base md:text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" /> CHI TIẾT SẢN PHẨM GIẢI CỨU
            </h3>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              F.R.E.S.H IMPACT RESCUE SYSTEM // LIVE DEALS
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          
          {/* Main Visual Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Image and Store Info */}
            <div className="space-y-4">
              <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-800 relative overflow-hidden select-none">
                {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl">{product.image || '🥦'}</span>
                )}
                
                {/* Discount Badge overlay */}
                <div className="absolute top-4 right-4 bg-orange-500 text-white font-mono px-3 py-1 rounded-lg text-sm font-black shadow-lg">
                  -{product.discount}%
                </div>

                {/* Expiry Badge overlay */}
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border uppercase tracking-wider shadow-lg ${exp.style}`}>
                    {exp.text}
                  </span>
                </div>
              </div>

              {/* Store & Location */}
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-mono uppercase">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> Cửa hàng đối tác
                </div>
                <div className="font-extrabold text-slate-800 dark:text-white text-base">
                  {product.storeName}
                </div>
                {product.distance !== undefined && (
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Khoảng cách: <span className="text-emerald-500 font-bold">{product.distance} km</span>
                  </div>
                )}
              </div>

              {/* ESG Carbon Impact */}
              {product.co2Saved !== undefined && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-xl text-white">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider font-bold">Bảo vệ môi trường</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Giảm thiểu <span className="text-emerald-500 font-black">{product.co2Saved} kg</span> khí CO2</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Detailed Fields */}
            <div className="space-y-4">
              
              {/* Product Info */}
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-850 dark:text-white leading-tight">
                  {product.name}
                </h4>
                <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                  Danh mục: {product.category}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block tracking-wider">Mô tả sản phẩm</span>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {product.description || 'Sản phẩm giải cứu thơm ngon, được bảo quản chất lượng chuẩn an toàn thực phẩm.'}
                </p>
              </div>

              {/* Technical details */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block tracking-wider">Chi tiết sản phẩm</span>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 font-medium">
                  {product.details || 'Bao bì nguyên vẹn. Bảo quản tủ mát/nhiệt độ phòng tùy loại sản phẩm. Thích hợp sử dụng ngay để giải quyết vấn đề lãng phí thức ăn.'}
                </p>
              </div>

              {/* MFG and EXP Dates */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40 font-mono text-[11px]">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Ngày sản xuất (MFG)
                  </div>
                  <div className="font-extrabold text-slate-850 dark:text-slate-200">
                    {product.mfgDate || '2026-05-26 06:00'}
                  </div>
                </div>
                <div className="space-y-1 border-l border-slate-200 dark:border-slate-800/60 pl-3">
                  <div className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> Hạn sử dụng (EXP)
                  </div>
                  <div className="font-extrabold text-rose-500 animate-pulse">
                    {product.expiryDate || product.expiry}
                  </div>
                </div>
              </div>

              {/* Nutrition Summary (JSONB) */}
              {product.nutrition && (product.nutrition.calories > 0 || product.nutrition.protein > 0) && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-sky-500" /> Chỉ số dinh dưỡng (Mỗi phần)
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold font-mono">
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-slate-400">Cal</span>
                      <span className="text-slate-850 dark:text-slate-200">{product.nutrition.calories}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-slate-400">Pro</span>
                      <span className="text-slate-850 dark:text-slate-200">{product.nutrition.protein}g</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-slate-400">Carbs</span>
                      <span className="text-slate-850 dark:text-slate-200">{product.nutrition.carbs}g</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-slate-400">Fat</span>
                      <span className="text-slate-850 dark:text-slate-200">{product.nutrition.fat}g</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="block text-slate-400">Fiber</span>
                      <span className="text-slate-850 dark:text-slate-200">{product.nutrition.fiber}g</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredients & Allergens */}
              {(product.ingredients && product.ingredients.length > 0) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block tracking-wider">Thành phần</span>
                  <div className="flex flex-wrap gap-1">
                    {product.ingredients.map(ing => (
                      <span key={ing} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens warning */}
              {(product.allergens && product.allergens.length > 0) && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-rose-450 font-mono uppercase block tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Cảnh báo dị ứng
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {product.allergens.map(alg => (
                      <span key={alg} className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/60 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold font-mono">Giá gốc sản phẩm</div>
              <div className="text-base line-through text-slate-400 font-mono">{product.originalPrice.toLocaleString()}đ</div>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 h-8 hidden sm:block" />
            <div>
              <div className="text-[10px] text-emerald-500 uppercase font-black font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Giá giải cứu VIP
              </div>
              <div className="text-2xl font-black text-emerald-500 font-mono leading-none mt-0.5">
                {product.aiPrice.toLocaleString()}đ
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <motion.button
              whileTap={buttonTap}
              onClick={() => onRescue(product)}
              disabled={product.stock <= 0 || isExpired || rescuingId === product.id}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {rescuingId === product.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang thanh toán...
                </>
              ) : (
                <>
                  Cứu Ngay Món Này
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
