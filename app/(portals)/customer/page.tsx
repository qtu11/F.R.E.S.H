'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Ticket, Clock, ShoppingBag, Wallet, Plus, Award, 
  Sparkles, ShieldCheck, HelpCircle, Loader2, ArrowUpRight, 
  ChevronRight, Compass, Heart, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { productService, Product } from '@/lib/data/products';
import ProductDetailModal from '@/components/ProductDetailModal';
import { orderService } from '@/lib/data/orders';
import { transactionService } from '@/lib/data/transactions';
import { showToast } from '@/lib/data/notifications';
import { 
  staggerContainer, staggerItem, fadeUp, scaleIn, slideUp,
  buttonTap, useSafeReducedMotion
} from '@/lib/animation';

// Confetti particle definition
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  scale: number;
}

export default function CustomerApp() {
  const { t } = useGlobal();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const [deals, setDeals] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescuingId, setRescuingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduced = useSafeReducedMotion();

  // 3D Card tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // Top Up Modal State
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000);
  const [topUpLoading, setTopUpLoading] = useState(false);

  // Confetti State
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  useEffect(() => { setMounted(true); }, []);

  const fetchCustomerDashboard = useCallback(() => {
    setLoading(true);
    productService.getLive()
      .then((products) => {
        // Filter out old seed trash products starting with 'p' (but keep 'rp' and UUIDs)
        const filteredProducts = (products || []).filter(
          (p) => !p.id.startsWith('p') || p.id.startsWith('rp')
        );
        setDeals(filteredProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast('error', 'Không thể tải danh sách món ăn cứu hộ');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchCustomerDashboard();
  }, [user, fetchCustomerDashboard]);

  // Card Mouse Tilt Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Tilt sensitivity values
    const rX = -(mouseY / height) * 20;
    const rY = (mouseX / width) * 20;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Top up balance handler
  const handleTopUpConfirm = async () => {
    if (topUpAmount <= 0) return;
    setTopUpLoading(true);
    try {
      await transactionService.addTransaction({
        userId: user!.id,
        amount: topUpAmount,
        type: 'topup',
        date: new Date().toISOString(),
        status: 'completed',
        description: 'Nạp tiền vào ví F.R.E.S.H',
        paymentMethod: 'momo'
      });
      await refreshUser();
      showToast('success', 'Nạp Tiền Thành Công', `Đã nạp +${topUpAmount.toLocaleString()}đ vào ví của bạn.`);
      setShowTopUp(false);
    } catch (e) {
      console.error(e);
      showToast('error', 'Lỗi Nạp Tiền', 'Hệ thống nạp tiền tạm thời bận.');
    } finally {
      setTopUpLoading(false);
    }
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: 30 + Math.random() * 40, // % from left
      y: 80, // starting height %
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 3500);
  };

  // Real payment & order placement
  const handleRescueNow = async (product: Product) => {
    if (!user) {
      showToast('error', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước khi cứu hộ món ăn.');
      return;
    }

    const totalCost = product.aiPrice + 7000; // Price + shipping/service fees
    const balance = user.walletBalance || 0;

    if (balance < totalCost) {
      showToast('error', 'Số Dư Không Đủ', 'Vui lòng nạp tiền vào ví F.R.E.S.H để tiếp tục.');
      setShowTopUp(true);
      return;
    }

    setRescuingId(product.id);
    try {
      // 1. Create real order. This automatically triggers stock deduction, user balance updates, and transaction logs!
      await orderService.create({
        userId: user.id,
        items: [{ 
          productId: product.id, 
          productName: product.name, 
          productImage: product.image, 
          quantity: 1, 
          unitPrice: product.aiPrice 
        }],
        storeName: product.storeName,
        storeId: product.storeId,
        subtotal: product.aiPrice,
        deliveryFee: 5000,
        serviceFee: 2000,
        discount: 0,
        total: totalCost,
        deliveryMethod: 'delivery',
        paymentMethod: 'wallet',
        address: user.address || 'Hồ Chí Minh, Việt Nam',
      });

      // 2. Subtract balance on frontend instantly via transaction service callback
      await transactionService.addTransaction({
        userId: user.id,
        amount: -totalCost,
        type: 'payment',
        date: new Date().toISOString(),
        status: 'completed',
        description: `Thanh toán cứu hộ món ăn: ${product.name}`,
        paymentMethod: 'wallet'
      });

      await refreshUser();
      triggerConfetti();
      showToast('success', 'Giải Cứu Thành Công!', `Đơn hàng ${product.name} đang được chuẩn bị.`);
      
      // Update local product listings state
      setDeals(prev => prev.map(d => d.id === product.id ? { ...d, stock: Math.max(0, d.stock - 1) } : d));
    } catch (e) {
      console.error(e);
      showToast('error', 'Thất Bại', 'Lỗi thanh toán giao dịch đơn hàng.');
    } finally {
      setRescuingId(null);
    }
  };

  // Expiry time display helper
  const getExpiryLabel = (expiryStr: string) => {
    const rem = new Date(expiryStr).getTime() - Date.now();
    if (rem <= 0) return { text: 'Hết hạn', style: 'text-red-500 bg-red-500/10 border-red-500/20' };
    const hrs = Math.round(rem / (60 * 60 * 1000));
    if (hrs <= 4) return { text: `Chỉ còn ${hrs}h!`, style: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse' };
    return { text: `${hrs} giờ nữa`, style: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  };

  return (
    <div className="space-y-8 select-none relative">
      
      {/* Celebration Confetti overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        {confetti.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: `${p.x}vw`, y: '90vh', rotate: 0 }}
            animate={{ 
              opacity: 0, 
              x: `${p.x + (Math.random() * 20 - 10)}vw`, 
              y: '10vh', 
              rotate: p.angle + 720 
            }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              width: '8px',
              height: '14px',
              backgroundColor: p.color,
              borderRadius: '2px',
              scale: p.scale
            }}
          />
        ))}
      </div>

      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 dark:border-slate-800/50"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-400 p-[2px] shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl overflow-hidden font-bold text-white">
                {user?.avatar && user.avatar.length > 2 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'W'
                )}
              </div>
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-[10px] text-white px-1.5 py-0.5 rounded-full font-black border border-slate-900 shadow-md">
              LV.3
            </span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
              {user?.name || 'CHIẾN BINH XANH'} <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              F.R.E.S.H MEMBER SINCE 2025 // ROLE: CUSTOMER
            </p>
          </div>
        </div>

        {/* ESG Impact Stats Badge */}
        <div className="flex gap-4">
          <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-center shadow-md">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Đã cứu hộ</span>
            <span className="text-base font-black text-slate-700 dark:text-slate-200">{(user?.foodRescued || 0).toLocaleString()} kg</span>
          </div>
          <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-center shadow-md">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Điểm Green Credit</span>
            <span className="text-base font-black text-emerald-500">{(user?.greenPoints || 0).toLocaleString()} P</span>
          </div>
        </div>
      </motion.div>

      {/* Main Interactive Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive 3D Wallet Card */}
        <div className="perspective-1000">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX: rotateX,
              rotateY: rotateY,
              transformStyle: 'preserve-3d'
            }}
            className="w-full h-56 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-3xl p-6 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-shadow duration-300 hover:shadow-emerald-500/10 cursor-pointer"
          >
            {/* Holographic reflection gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),_rgba(255,255,255,0.08)_0%,_transparent_60%)] pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                  F.R.E.S.H VIP Wallet
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">SECURE PASS</span>
            </div>

            <div className="z-10 mt-6">
              <span className="text-slate-400 text-[10px] uppercase block tracking-wider font-bold">SỐ DƯ KHẢ DỤNG</span>
              <span className="text-white text-3xl font-black font-mono tracking-wide mt-1 block">
                {(user?.walletBalance || 0).toLocaleString()}<span className="text-lg font-light text-slate-400 ml-1">đ</span>
              </span>
            </div>

            <div className="flex justify-between items-end z-10">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-mono">Chủ sở hữu</span>
                <span className="text-xs text-white font-extrabold tracking-wide uppercase">{user?.name}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowTopUp(true)}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Nạp Tiền
                </button>
                <button 
                  onClick={() => router.push('/customer/vouchers')}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Đổi Quà
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Custom Radar Vector Map replacing thô Google Maps */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg relative overflow-hidden flex flex-col justify-between h-56">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-850 dark:text-white tracking-wider flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-emerald-500" /> BẢN ĐỒ RADAR ƯU ĐÃI
              </h3>
              <p className="text-[10px] font-mono text-slate-450 dark:text-slate-500 mt-0.5">TÌM KIẾM CỬA HÀNG FRESH GẦN NHẤT</p>
            </div>
            <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
              RADAR ACTIVE
            </span>
          </div>

          {/* Simulated Radar Scanning animation screen */}
          <div className="absolute right-6 top-8 w-40 h-40 border border-emerald-500/20 rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-28 h-28 border border-emerald-500/10 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 border border-emerald-500/5 rounded-full flex items-center justify-center" />
            </div>
            {/* Sweeper sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-emerald-500/10 rounded-full animate-[spin_5s_linear_infinite]" />
            
            {/* Blips */}
            <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="absolute bottom-10 right-6 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" style={{ animationDelay: '1s' }} />
          </div>

          <div className="z-10 mt-auto">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500 animate-bounce" />
              <span>Phát hiện <span className="text-emerald-500 font-extrabold">2 Đối tác lớn</span> (Winmart, Circle K) cách dưới 1.2km</span>
            </div>
            <p className="text-[10px] text-slate-450 mt-1">Lượng thức ăn cứu trợ sẵn sàng: 12 gói thực phẩm</p>
          </div>
        </div>
      </div>

      {/* Active food listings grid */}
      <div className="space-y-6">
        <h2 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-500" /> THỰC PHẨM ĐANG CHỜ CỨU HỘ GẦN BẠN
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/40 dark:bg-slate-900/40 rounded-2xl h-44 animate-pulse border border-slate-800/10" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12 text-slate-450 font-mono text-sm border border-dashed border-slate-700/30 rounded-2xl">
            Hiện tại không có deal nào hoạt động gần bạn.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deals.map((item) => {
              const exp = getExpiryLabel(item.expiry);
              const isExpired = exp.text === 'Hết hạn';
              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-2xl p-5 border border-white/20 dark:border-slate-800/80 shadow-md hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Header card info */}
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase tracking-wider ${exp.style}`}>
                        {exp.text}
                      </span>
                      <span className="text-[10px] bg-orange-500 text-white font-mono px-2 py-0.5 rounded font-black">
                        -{item.discount}%
                      </span>
                    </div>

                    {/* Food graphic or icon emoji & title */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center shadow-inner border border-white/10 shrink-0 overflow-hidden select-none group-hover:rotate-12 transition-transform">
                        {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{item.image || '🥦'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-base block group-hover:text-emerald-500 transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-450 font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-orange-500" /> {item.storeName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & pricing */}
                  <div className="mt-6 border-t border-slate-200 dark:border-slate-800/60 pt-4 flex justify-between items-center">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-mono">Giá giải cứu</div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-slate-850 dark:text-white font-mono">{item.aiPrice.toLocaleString()}đ</span>
                        <span className="text-[10px] line-through text-slate-450 font-mono">{item.originalPrice.toLocaleString()}đ</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleRescueNow(item); }}
                      disabled={item.stock <= 0 || isExpired || rescuingId === item.id}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 disabled:opacity-40 transition-all flex items-center gap-1"
                    >
                      {rescuingId === item.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang cứu...
                        </>
                      ) : (
                        <>
                          Cứu Ngay
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Up Wallet Glass Dialog Modal */}
      <AnimatePresence>
        {showTopUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-slate-800/60 bg-slate-950/40 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500" /> NẠP TIỀN VÀO VÍ
                  </h3>
                  <p className="text-[9px] font-mono text-slate-500">MOMOPAY / VNPAY INTEGRATED SECURE GATEWAY</p>
                </div>
                <button 
                  onClick={() => setShowTopUp(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-mono block uppercase">Chọn số tiền nạp</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[50000, 100000, 200000, 500000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 rounded-xl text-sm font-bold font-mono border transition-all ${
                          topUpAmount === amt 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10' 
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {amt.toLocaleString()}đ
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono leading-relaxed mt-4 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Cổng thanh toán tự động cập nhật số dư tài khoản của bạn lập tức qua kết nối database F.R.E.S.H.</span>
                </div>

                <button
                  onClick={handleTopUpConfirm}
                  disabled={topUpLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 mt-6"
                >
                  {topUpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Vui lòng chờ...
                    </>
                  ) : (
                    <>
                      Xác Nhận Nạp {topUpAmount.toLocaleString()}đ
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onRescue={async (p) => {
          setSelectedProduct(null);
          await handleRescueNow(p);
        }}
        rescuingId={rescuingId}
        walletBalance={user?.walletBalance || 0}
      />
    </div>
  );
}
