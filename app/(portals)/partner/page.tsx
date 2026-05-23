'use client';

import { useState, useEffect } from 'react';
import { 
  ScanBarcode, TrendingUp, Package, Leaf, X, Check, Loader2, 
  Clock, AlertCircle, Sparkles, CheckCircle2, ChevronRight, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/app/providers';
import { useAuth } from '@/app/contexts/AuthContext';
import { productService, Product, ProductCategory } from '@/lib/data/products';
import { orderService, Order, OrderStatus } from '@/lib/data/orders';
import { showToast } from '@/lib/data/notifications';
import { 
  staggerContainer, staggerItem, fadeUp, scaleIn, slideUp,
  buttonTap, useSafeReducedMotion, cardHover
} from '@/lib/animation';

export default function PartnerApp() {
  const { t } = useGlobal();
  const { user } = useAuth();
  const storeId = user?.storeId || '';
  
  const [listings, setListings] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced = useSafeReducedMotion();
  
  // Tab control for listings vs orders
  const [activeTab, setActiveTab] = useState<'listings' | 'orders'>('listings');

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scannerStage, setScannerStage] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedCode, setScannedCode] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    originalPrice: 0,
    discount: 30,
    stock: 5,
    expiry: '',
    category: 'Bakery' as ProductCategory,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!storeId) return;
    fetchStoreData();
  }, [storeId]);

  const fetchStoreData = () => {
    setLoading(true);
    Promise.all([
      productService.getByStore(storeId),
      orderService.getByStore(storeId)
    ]).then(([productsData, ordersData]) => {
      setListings(productsData || []);
      setOrders(ordersData || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  // Sound Beep Generator via Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Pitch A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 150);
    } catch (e) {
      console.warn('Audio Context not allowed or supported yet', e);
    }
  };

  // Calculations based on orders
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const todaysRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const itemsRescued = completedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const co2Reduced = Math.round(itemsRescued * 1.2);

  const handleScanClick = () => {
    setForm({ name: '', originalPrice: 0, discount: 35, stock: 5, expiry: '', category: 'Bakery' });
    setScannedCode('');
    setScannerStage('scanning');
    setShowScanner(true);
    
    // Simulate barcode capture in 2 seconds
    setTimeout(() => {
      playBeep();
      setScannerStage('success');
      setScannedCode('8934563128912');
      // Autofill mock values for immersive simulation
      const randomProducts = [
        { name: 'Bánh Mì Baguette Pháp', price: 28000, category: 'Bakery' as const },
        { name: 'Sữa Tươi Nguyên Chất 1L', price: 42000, category: 'Dairy' as const },
        { name: 'Salad Ức Gà Cầu Vồng', price: 65000, category: 'Meals' as const },
        { name: 'Hộp Dâu Tây Đà Lạt 250g', price: 85000, category: 'Fruits' as const },
        { name: 'Croissant Bơ Tỏi Nướng', price: 35000, category: 'Bakery' as const }
      ];
      const selected = randomProducts[Math.floor(Math.random() * randomProducts.length)];
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      const tomorrowIso = tomorrow.toISOString().substring(0, 16);

      setForm({
        name: selected.name,
        originalPrice: selected.price,
        discount: 40,
        stock: 6,
        expiry: tomorrowIso,
        category: selected.category
      });
    }, 2000);
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.originalPrice || !form.expiry) {
      showToast('error', 'Thiếu Thông Tin', 'Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    setSubmitting(true);
    const aiPrice = Math.round(form.originalPrice * (1 - form.discount / 100));
    const storeName = (user as any)?.storeName || (user as any)?.partnerStoreName || 'Cửa hàng của bạn';
    
    try {
      const created = await productService.create({
        name: form.name,
        image: form.category === 'Bakery' ? '🥖' : form.category === 'Dairy' ? '🥛' : form.category === 'Fruits' ? '🍓' : '🥗',
        storeName,
        storeId,
        originalPrice: form.originalPrice,
        aiPrice,
        discount: form.discount,
        stock: form.stock,
        expiry: form.expiry,
        category: form.category,
        status: 'live',
      });
      if (created) {
        setListings(prev => [created, ...prev]);
        showToast('success', 'Đã Thêm Sản Phẩm!', `${form.name} đã sẵn sàng trên F.R.E.S.H.`);
      }
      setShowScanner(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'Thất Bại', 'Lỗi thêm sản phẩm vào kho dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order workflow actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        
        let msg = 'Đơn hàng đã được cập nhật.';
        if (newStatus === 'preparing') msg = 'Đã xác nhận và đang chuẩn bị đơn hàng.';
        if (newStatus === 'delivered') msg = 'Giao hàng thành công! Doanh thu đã cộng vào ví.';
        if (newStatus === 'cancelled') msg = 'Đơn hàng đã bị huỷ.';
        
        showToast('success', 'Thành Công', msg);
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Thất Bại', 'Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  // Helper for computing Expiry indicator percentages
  const getExpiryProgress = (expiryStr: string) => {
    const total = 48 * 60 * 60 * 1000; // 48 hours max scale for display
    const rem = new Date(expiryStr).getTime() - Date.now();
    if (rem <= 0) return { pct: 0, text: 'Hết hạn', color: 'bg-rose-500 animate-pulse' };
    
    const pct = Math.max(0, Math.min(100, (rem / total) * 100));
    let color = 'bg-emerald-500';
    let text = `${Math.round(rem / (60 * 60 * 1000))} giờ`;
    
    if (rem < 4 * 60 * 60 * 1000) {
      color = 'bg-rose-600 animate-pulse';
      text = 'Cực kỳ khẩn cấp!';
    } else if (rem < 12 * 60 * 60 * 1000) {
      color = 'bg-amber-500';
      text = `${Math.round(rem / (60 * 60 * 1000))} giờ còn lại`;
    }
    
    return { pct, text, color };
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 select-none">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 dark:border-slate-800/50"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {t('partner_dashboard') || 'CỔNG TÁC TÁC FRESH'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tracking-wider">
            CỬA HÀNG: <span className="text-orange-500 font-bold">{(user as any)?.storeName || 'FRESH_STORE'}</span> | ID: {storeId.substring(0, 8)}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'listings' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-white/40 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-white/10 dark:border-slate-800'
            }`}
          >
            Kho Hàng Sẵn Có ({listings.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'orders' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-white/40 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-white/10 dark:border-slate-800'
            }`}
          >
            Đơn Hàng Mới ({orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})
          </button>
        </div>
      </motion.div>

      {/* Overview Stats Cards */}
      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div 
          variants={staggerItem}
          className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-900/20 dark:to-transparent bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg"
        >
          <div className="text-slate-500 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase mb-1">
            {t('todays_revenue') || 'DOANH THU ĐÃ CỨU HÔM NAY'}
          </div>
          <div className="text-black dark:text-white font-black text-3xl tracking-tight mt-1 flex items-baseline gap-1">
            {todaysRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">VNĐ</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-200 dark:border-slate-800/60 pt-4">
            <div>
              <span className="text-slate-400 text-[9px] font-bold block uppercase">Số món giải cứu</span>
              <span className="text-lg font-black text-slate-800 dark:text-white">{itemsRescued} món</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] font-bold block uppercase">Giảm CO₂ tương ứng</span>
              <span className="text-lg font-black text-emerald-500">{co2Reduced} kg</span>
            </div>
          </div>
        </motion.div>

        <motion.button 
          onClick={handleScanClick}
          variants={staggerItem}
          whileHover={reduced ? {} : { scale: 1.03 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          className="md:col-span-2 w-full bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 flex flex-col justify-between shadow-xl cursor-pointer hover:shadow-orange-500/10 transition-all border border-orange-400/30"
        >
          <div className="flex justify-between items-start w-full">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase">
              BARCODE RADAR V2
            </span>
            <ScanBarcode className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="mt-8 text-left">
            <h3 className="font-black text-xl tracking-wide uppercase">
              {t('scan_new_product') || 'QUÉT SẢN PHẨM MỚI'}
            </h3>
            <p className="text-[10px] text-orange-100 font-mono mt-1">
              Hệ thống tự động phân loại, nhận dạng giá tối ưu AI.
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Main interactive tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'listings' ? (
          <motion.div 
            key="listings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg overflow-x-auto">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" /> KHO SẢN PHẨM HOẠT ĐỘNG
              </h3>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-mono text-sm">
                  Không tìm thấy sản phẩm nào đang hoạt động.
                </div>
              ) : (
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-6 gap-4 text-[10px] font-bold text-slate-400 mb-4 px-4 uppercase font-mono border-b border-slate-200 dark:border-slate-800/60 pb-3">
                    <div className="col-span-2">Tên sản phẩm</div>
                    <div className="text-center">Số lượng kho</div>
                    <div className="text-center">Giá AI / Giá gốc</div>
                    <div className="col-span-2">Hạn sử dụng F.R.E.S.H</div>
                  </div>

                  <div className="space-y-3">
                    {listings.map((item) => {
                      const exp = getExpiryProgress(item.expiry);
                      return (
                        <div 
                          key={item.id}
                          className="grid grid-cols-6 gap-4 items-center bg-white/40 dark:bg-slate-900/30 p-3 rounded-xl border border-white/10 dark:border-slate-800/50 hover:bg-emerald-500/5 transition-all"
                        >
                          <div className="col-span-2 flex items-center gap-3">
                            <span className="text-2xl bg-slate-200 dark:bg-slate-800 w-10 h-10 rounded-lg flex items-center justify-center border border-white/10">{item.image}</span>
                            <div>
                              <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200 block">{item.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono uppercase">{item.category}</span>
                            </div>
                          </div>
                          
                          <div className="text-center font-bold text-slate-700 dark:text-slate-350">{item.stock} cái</div>
                          
                          <div className="text-center">
                            <div className="font-black text-emerald-500 text-sm">{item.aiPrice.toLocaleString()}đ</div>
                            <div className="text-[10px] text-slate-400 line-through">{item.originalPrice.toLocaleString()}đ</div>
                          </div>

                          <div className="col-span-2 flex items-center gap-3">
                            <div className="flex-1">
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className={`h-full ${exp.color}`} style={{ width: `${exp.pct}%` }} />
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0">
                              {exp.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white/60 dark:bg-slate-900/65 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg">
              <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500 animate-pulse" /> ĐƠN HÀNG ĐANG XỬ LÝ
              </h3>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-mono text-sm">
                  Cửa hàng chưa có đơn hàng mới nào cần xử lý.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-white/10 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/20 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                              <span>{item.productImage}</span>
                              <span>{item.productName}</span>
                              <span className="text-xs text-slate-450">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-slate-400">
                          Địa chỉ giao: <span className="text-slate-300 font-bold">{order.address || 'Lấy trực tiếp'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] font-mono block">Tổng hóa đơn</span>
                          <span className="text-lg font-black text-emerald-500">{order.total.toLocaleString()}đ</span>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-xs hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Xác Nhận Đơn
                            </button>
                          )}

                          {(order.status === 'preparing' || order.status === 'ready' || order.status === 'in_transit') && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              className="flex-1 md:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg font-bold text-xs hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Xác nhận đã giao
                            </button>
                          )}

                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors"
                            title="Hủy đơn hàng"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber Barcode Scanner Mock Dialog */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-950/40">
                <div>
                  <h3 className="font-black text-white text-base tracking-wider uppercase flex items-center gap-2">
                    <ScanBarcode className="w-5 h-5 text-amber-500" /> CYBER SCANNER ENG_V2
                  </h3>
                  <span className="text-[9px] font-mono text-slate-500">MÁY QUÉT BARCODE CỨU TRỢ AI</span>
                </div>
                <button 
                  onClick={() => setShowScanner(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scanning visual simulator */}
              <div className="p-6 space-y-6">
                {scannerStage === 'scanning' ? (
                  <div className="relative h-44 bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center">
                    {/* Laser Line Animation */}
                    <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_12px_#ef4444] animate-[bounce_2s_infinite]" />
                    
                    {/* Camera Bracket corner markers */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-500" />

                    <div className="flex flex-col items-center gap-2 z-10">
                      <ScanBarcode className="w-12 h-12 text-slate-600 animate-pulse" />
                      <span className="text-[10px] font-mono text-amber-500/80 tracking-widest uppercase animate-pulse">
                        ĐANG DÒ QUÉT THỰC PHẨM...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Capture success */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-mono text-slate-350">MÃ QUÉT: <span className="text-white font-bold">{scannedCode}</span></span>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">NHẬN DẠNG OK</span>
                    </div>

                    {/* Filling inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Tên món ăn</label>
                        <input 
                          type="text" 
                          value={form.name} 
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Giá gốc (VNĐ)</label>
                          <input 
                            type="number" 
                            value={form.originalPrice || ''} 
                            onChange={e => setForm(f => ({ ...f, originalPrice: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Giảm giá (%)</label>
                          <input 
                            type="number" 
                            value={form.discount} 
                            onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Số lượng tồn</label>
                          <input 
                            type="number" 
                            value={form.stock} 
                            onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Hạn dùng F.R.E.S.H</label>
                          <input 
                            type="datetime-local" 
                            value={form.expiry} 
                            onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Danh mục</label>
                          <select 
                            value={form.category} 
                            onChange={e => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                          >
                            {(['Bakery', 'Dairy', 'Fruits', 'Meals', 'Beverages', 'Snacks'] as ProductCategory[]).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Giá cứu trợ đề xuất AI</label>
                          <div className="w-full px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-extrabold text-sm flex items-center h-[42px] font-mono">
                            {form.originalPrice ? `${Math.round(form.originalPrice * (1 - form.discount / 100)).toLocaleString()}đ` : '0đ'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleAddProduct}
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 mt-6"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Vui lòng chờ...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Đưa lên F.R.E.S.H radar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
